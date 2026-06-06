from __future__ import annotations

import json
import logging
from typing import Any

import httpx

from app.config import settings
from app.services.cencori_ai import native_chat

logger = logging.getLogger("gridpulse.gateway")


async def route_agent_payload(payload: dict[str, Any]) -> dict[str, Any]:
    """
    Cencori AI Gateway enrichment for LangGraph agent cycles.
    When CENCORI_API_KEY is unset, returns payload unchanged (local dev mode).
    """
    if not settings.cencori_api_key:
        return payload

    try:
        summary = json.dumps(
            {
                "cycle_id": payload.get("cycle_id"),
                "stations": [
                    {
                        "id": s.get("station_id"),
                        "type": s.get("type"),
                        "grid_active": s.get("grid_active"),
                        "location": s.get("location"),
                    }
                    for s in (payload.get("telemetry") or [])
                ],
            },
            indent=2,
        )
        response = await native_chat(
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are GridPulse agent router. Return JSON only: "
                        '{"priority":"normal|high","notes":"..."}'
                    ),
                },
                {"role": "user", "content": f"Route this telemetry batch:\n{summary}"},
            ],
        )
        content = response.get("content") or response.get("choices", [{}])[0].get("message", {}).get("content")
        if content:
            try:
                routing = json.loads(content) if isinstance(content, str) else content
                payload["cencori_routing"] = routing
            except json.JSONDecodeError:
                payload["cencori_routing"] = {"notes": str(content)[:200]}
        return payload
    except Exception as exc:
        logger.warning("Cencori gateway unavailable, using local passthrough: %s", exc)
        return payload
