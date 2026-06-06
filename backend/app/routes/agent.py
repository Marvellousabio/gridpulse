from __future__ import annotations

import asyncio
import json

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.models.schemas import AgentCycleRequest, AgentCycleResponse
from app.services.agent import run_balancer_cycle
from app.services.state import app_state
from app.services.telemetry import apply_telemetry_snapshot, telemetry_needs_agent

router = APIRouter(prefix="/api", tags=["agent", "telemetry"])


@router.get("/telemetry/stations")
async def get_telemetry_stations():
    return {"stations": app_state.telemetry}


@router.post("/telemetry/ingest")
async def ingest_telemetry(stations: list[dict]):
    """Accept polymorphic IoT payloads (AWS IoT Core / simulator POST target)."""
    await app_state.set_telemetry(stations)
    return {"accepted": len(stations), "stations": app_state.telemetry}


@router.post("/telemetry/simulate")
async def simulate_telemetry(force_scenario: str | None = None):
    readings = await apply_telemetry_snapshot(force_scenario)
    triggered = False
    if telemetry_needs_agent(readings):
        await run_balancer_cycle(telemetry=readings)
        triggered = True
    return {"stations": readings, "agent_triggered": triggered}


@router.post("/agent/cycle", response_model=AgentCycleResponse)
async def trigger_agent_cycle(body: AgentCycleRequest | None = None):
    force = body.force_scenario if body else None
    result = await run_balancer_cycle(force_scenario=force)
    return AgentCycleResponse(**result)


@router.get("/agent/activity")
async def get_agent_activity():
    return {
        "cycles_run": app_state.agent_cycles_run,
        "actions": app_state.agent_actions,
        "terminal_logs": app_state.terminal_logs[:20],
    }


@router.get("/ledger/onchain")
async def get_onchain_ledger():
    return {"entries": app_state.onchain_ledger}


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
    """Simple polling hint — use WebSocket /api/ws/live for real-time."""
    return {
        "websocket": "/api/ws/live",
        "poll_interval_seconds": 5,
        "latest": app_state.telemetry,
    }
