from __future__ import annotations

import asyncio
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routes import agent, dashboard, health
from app.services.agent import run_balancer_cycle
from app.services.telemetry import apply_telemetry_snapshot, telemetry_needs_agent

logger = logging.getLogger("gridpulse")


def create_app() -> FastAPI:
    app = FastAPI(
        title="GridPulse API",
        description="B2B energy middleware — IoT telemetry, LangGraph balancer agent, dashboard API",
        version="0.1.0",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health.router)
    app.include_router(dashboard.router)
    app.include_router(agent.router)

    @app.on_event("startup")
    async def startup() -> None:
        asyncio.create_task(_telemetry_loop())
        logger.info("GridPulse API started on %s:%s", settings.host, settings.port)

    return app


async def _telemetry_loop() -> None:
    """Background IoT simulation — mimics AWS IoT Core stream for demo."""
    await asyncio.sleep(2)
    while True:
        try:
            readings = await apply_telemetry_snapshot()
            if settings.auto_agent_cycles and telemetry_needs_agent(readings):
                await run_balancer_cycle(telemetry=readings)
        except Exception:
            logger.exception("Telemetry loop error")
        await asyncio.sleep(settings.telemetry_interval_seconds)


app = create_app()
