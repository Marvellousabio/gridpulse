from __future__ import annotations

import json

from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel

from app.models.schemas import AgentCycleRequest, AgentCycleResponse
from app.services.agent import run_balancer_cycle
from app.services.state import app_state
from app.services.telemetry import apply_telemetry_snapshot, telemetry_needs_agent

router = APIRouter(prefix="/api", tags=["agent", "telemetry"])


class TelemetryStation(BaseModel):
    station_id: str
    name: str
    type: str
    location: str
    lat: float
    lng: float
    grid_active: bool
    solar_soc_pct: float | None = None
    available_batteries: int | None = None
    hydrogen_psi: float | None = None
    available_canisters: int | None = None
    timestamp: str | None = None


@router.get("/telemetry/stations")
async def get_telemetry_stations():
    return {"stations": await app_state.snapshot("telemetry")}


@router.post("/telemetry/ingest")
async def ingest_telemetry(stations: list[TelemetryStation]):
    """Accept polymorphic IoT payloads (AWS IoT Core / simulator POST target)."""
    payload = [station.model_dump(exclude_none=True) for station in stations]
    await app_state.set_telemetry(payload)
    return {"accepted": len(payload), "stations": await app_state.snapshot("telemetry")}


@router.post("/telemetry/simulate")
async def simulate_telemetry(force_scenario: str | None = None):
    if force_scenario and force_scenario not in {"grid_outage_yaba", "normal"}:
        raise HTTPException(status_code=400, detail="Invalid scenario")
    readings = await apply_telemetry_snapshot(force_scenario)
    triggered = False
    if telemetry_needs_agent(readings):
        await run_balancer_cycle(telemetry=readings)
        triggered = True
    return {"stations": readings, "agent_triggered": triggered}


@router.post("/agent/cycle", response_model=AgentCycleResponse)
async def trigger_agent_cycle(body: AgentCycleRequest | None = None):
    force = body.force_scenario if body else None
    if force and force not in {"grid_outage_yaba", "normal"}:
        raise HTTPException(status_code=400, detail="Invalid force_scenario")
    result = await run_balancer_cycle(force_scenario=force)
    return AgentCycleResponse(**result)


@router.get("/agent/activity")
async def get_agent_activity():
    return {
        "cycles_run": (await app_state.snapshot("agent_cycles_run")),
        "actions": await app_state.snapshot("agent_actions"),
        "terminal_logs": (await app_state.snapshot("terminal_logs"))[:20],
    }


@router.get("/ledger/onchain")
async def get_onchain_ledger():
    return {"entries": await app_state.snapshot("onchain_ledger")}


@router.websocket("/ws/live")
async def live_updates(websocket: WebSocket):
    await websocket.accept()
    queue = app_state.subscribe()
    try:
        while True:
            payload = await queue.get()
            await websocket.send_text(json.dumps(payload))
    except WebSocketDisconnect:
        app_state.unsubscribe(queue)
    except Exception:
        app_state.unsubscribe(queue)
        raise


@router.get("/telemetry/stream")
async def telemetry_stream():
    return {
        "websocket": "/api/ws/live",
        "poll_interval_seconds": 5,
        "latest": await app_state.snapshot("telemetry"),
    }
