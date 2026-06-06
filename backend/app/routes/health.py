from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter

from app.models.schemas import HealthResponse
from app.services.state import app_state

router = APIRouter(tags=["system"])


@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    return HealthResponse(
        status="ok",
        service="gridpulse-api",
        version="0.1.0",
        telemetry_stations=len(app_state.telemetry),
        agent_cycles_run=app_state.agent_cycles_run,
        timestamp=datetime.now(timezone.utc).isoformat(),
    )
