"""Claude API — cluster rebalance reasoning (FORECAST + ALLOCATE + audit trace)."""

from __future__ import annotations

import json
import logging
import re
from typing import Any

import httpx

from app.config import settings

logger = logging.getLogger("gridpulse.claude")

SYSTEM_PROMPT = """You are GridPulse Balancer, an autonomous energy orchestrator for Lagos EV fleets.
You analyze cluster telemetry where Li-ion swap cabinets and hydrogen canister hubs are normalized to kWh-equivalent.

Respond with ONLY valid JSON (no markdown fences) matching this schema:
{
  "depletionHorizonMin": number,
  "demandSpikeFactor": number,
  "confidence": number between 0 and 1,
  "vehiclesToReroute": integer,
  "targetNodeId": "node id string",
  "crossChemistry": boolean,
  "loadShiftNodeId": "node id or null",
  "loadShiftSource": "SOLAR_PV" | "DIESEL_GENSET" | "GRID" | null,
  "humanApprovalRequired": boolean,
  "kwhEqSettlement": number,
  "reasoningTrace": ["ASSESS: ...", "FORECAST: ...", "ALLOCATE: ...", "REROUTE: ...", "SETTLE: ..."]
}

Rules:
- Prefer routing dual-power okada fleets to H2 hubs when Li-ion is grid-stressed and H2 has surplus kWh-eq.
- humanApprovalRequired only if kwhEqSettlement > 50 or vehiclesToReroute > 20.
- reasoningTrace must have exactly 5 lines, each prefixed with the phase name.
"""


def claude_enabled() -> bool:
    return bool(settings.claude_reasoning and settings.anthropic_api_key)


def _extract_json(text: str) -> dict[str, Any]:
    text = text.strip()
    if text.startswith("{"):
        return json.loads(text)
    match = re.search(r"\{[\s\S]*\}", text)
    if not match:
        raise ValueError("No JSON object in Claude response")
    return json.loads(match.group())


async def analyze_cluster_rebalance(
    cluster_id: str,
    nodes: list[dict[str, Any]],
    fleet_context: dict[str, Any],
) -> dict[str, Any] | None:
    """
    Call Anthropic Messages API. Returns parsed decision dict or None on failure.
    """
    if not claude_enabled():
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
                "content": (
                    "Analyze this Lagos cluster telemetry after a grid failure. "
                    "Recommend cross-chemistry reroute if appropriate.\n\n"
                    + json.dumps(user_payload, indent=2)
                ),
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
            parsed = _extract_json(text)
            logger.info("Claude rebalance decision for %s: %s vehicles", cluster_id, parsed.get("vehiclesToReroute"))
            return parsed
    except Exception as exc:
        logger.warning("Claude API unavailable, using rule fallback: %s", exc)
        return None
