from __future__ import annotations

import logging
from typing import Any

import httpx

from app.config import settings

logger = logging.getLogger("gridpulse.gateway")


async def route_agent_payload(payload: dict[str, Any]) -> dict[str, Any]:
    """
    Optional Cencori AI Gateway passthrough.
    When CENCORI_API_URL is unset, returns payload unchanged (local dev mode).
    Gateway failures never crash the agent loop.
    """
    if not settings.cencori_api_url:
        return payload

    headers = {"Content-Type": "application/json"}
    if settings.cencori_api_key:
        headers["Authorization"] = f"Bearer {settings.cencori_api_key}"

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                f"{settings.cencori_api_url.rstrip('/')}/v1/agent/route",
                json=payload,
                headers=headers,
            )
            response.raise_for_status()
            return response.json()
    except Exception as exc:
        logger.warning("Cencori gateway unavailable, using local passthrough: %s", exc)
        return payload
