from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter

from app.models.schemas import HealthResponse
from app.services.state import app_state

router = APIRouter(tags=["system"])


@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    cycles = await app_state.snapshot("agent_cycles_run")
    telemetry = await app_state.snapshot("telemetry")
    return HealthResponse(
        status="ok",
        service="gridpulse-api",
        version="0.1.0",
        telemetry_stations=len(telemetry),
        agent_cycles_run=cycles,
        timestamp=datetime.now(timezone.utc).isoformat(),
    )
