from __future__ import annotations

from fastapi import APIRouter

from app.services.agent import run_balancer_cycle
from app.services.state import app_state
from app.services.telemetry import apply_telemetry_snapshot

router = APIRouter(prefix="/api/demo", tags=["demo"])


@router.post("/trigger")
async def trigger_stage_demo():
    """
    One-click stage demo: Yaba grid outage → LangGraph reroute → ledger settlement.
    Safe to call repeatedly; agent lock prevents overlapping cycles.
    """
    readings = await apply_telemetry_snapshot("grid_outage_yaba")
    result = await run_balancer_cycle(telemetry=readings)

    return {
        "ok": True,
        "scenario": "grid_outage_yaba",
        "cycle_id": result["cycle_id"],
        "alerts": result["alerts"],
        "actions": result["actions"],
        "ledger_entries": result["ledger_entries"],
        "terminal_log_count": len(await app_state.snapshot("terminal_logs")),
        "message": (
            "Grid outage at Yaba detected. Dual-power fleet rerouted to H2 hub. "
            "Settlement logged to on-chain ledger."
            if result["actions"]
            else "Scenario executed — network within thresholds."
        ),
    }
