"""Legacy import path — rebalance reasoning now routes through Cencori when configured."""

from __future__ import annotations

import json
import logging
from typing import Any

import httpx

from app.config import settings
from app.services.cencori_ai import analyze_cluster_rebalance as analyze_via_cencori
from app.services.cencori_ai import cencori_enabled

logger = logging.getLogger("gridpulse.claude")

SYSTEM_PROMPT = """You are GridPulse Balancer, an autonomous energy orchestrator for Lagos EV fleets.
Respond with ONLY valid JSON matching the rebalance decision schema. No markdown fences.
"""


def claude_enabled() -> bool:
    """True when any AI reasoning backend is configured (Cencori preferred)."""
    return cencori_enabled() or bool(settings.ai_reasoning and settings.anthropic_api_key)


async def analyze_cluster_rebalance(
    cluster_id: str,
    nodes: list[dict[str, Any]],
    fleet_context: dict[str, Any],
) -> dict[str, Any] | None:
    if cencori_enabled():
        result = await analyze_via_cencori(cluster_id, nodes, fleet_context)
        if result:
            return result

    if not settings.ai_reasoning or not settings.anthropic_api_key:
        return None

    user_payload = {
        "clusterId": cluster_id,
        "trigger": "GRID_FAILURE",
        "nodes": [
            {
                "nodeId": n["node"]["nodeId"],
                "assetClass": n["node"]["assetClass"],
                "operatorId": n["node"]["operatorId"],
                "gridAvailable": n["node"]["powerSource"]["gridAvailable"],
                "availableKwhEq": n["availableKwhEq"],
                "currentSource": n["node"]["powerSource"]["currentSource"],
            }
            for n in nodes
        ],
        "fleetAtRisk": fleet_context,
    }

    body = {
        "model": settings.anthropic_model,
        "max_tokens": 1024,
        "system": SYSTEM_PROMPT,
        "messages": [
            {
                "role": "user",
                "content": json.dumps(user_payload, indent=2),
            }
        ],
    }

    try:
        async with httpx.AsyncClient(timeout=45.0) as client:
            response = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "x-api-key": settings.anthropic_api_key,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json",
                },
                json=body,
            )
            response.raise_for_status()
            data = response.json()
            blocks = data.get("content") or []
            text = "".join(b.get("text", "") for b in blocks if b.get("type") == "text")
            import re

            match = re.search(r"\{[\s\S]*\}", text.strip())
            if not match:
                return None
            return json.loads(match.group())
    except Exception as exc:
        logger.warning("Anthropic fallback unavailable: %s", exc)
        return None
