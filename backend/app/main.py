from __future__ import annotations

import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.routes import agent, dashboard, demo, health, v1
from app.services.agent import run_balancer_cycle
from app.services.telemetry import apply_telemetry_snapshot, telemetry_needs_agent

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")
logger = logging.getLogger("gridpulse")


@asynccontextmanager
async def lifespan(app: FastAPI):
    telemetry_task = asyncio.create_task(_telemetry_loop())
    logger.info("GridPulse API ready — CORS origins: %s", settings.cors_origin_list)
    yield
    telemetry_task.cancel()
    try:
        await telemetry_task
    except asyncio.CancelledError:
        pass


def create_app() -> FastAPI:
    app = FastAPI(
        title="GridPulse API",
        description="B2B energy middleware — IoT telemetry, LangGraph balancer agent, dashboard API",
        version="0.1.0",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["*"],
    )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception):
        logger.exception("Unhandled error on %s", request.url.path)
        return JSONResponse(status_code=500, content={"detail": "Internal server error"})

    app.include_router(health.router)
    app.include_router(v1.router)
    app.include_router(dashboard.router)
    app.include_router(agent.router)
    app.include_router(demo.router)

    return app


async def _telemetry_loop() -> None:
    """Background IoT simulation — mimics AWS IoT Core stream for demo."""
    await asyncio.sleep(3)
    while True:
        try:
            readings = await apply_telemetry_snapshot()
            if settings.auto_agent_cycles and telemetry_needs_agent(readings):
                await run_balancer_cycle(telemetry=readings)
        except asyncio.CancelledError:
            raise
        except Exception:
            logger.exception("Telemetry loop error")
        await asyncio.sleep(settings.telemetry_interval_seconds)


app = create_app()
