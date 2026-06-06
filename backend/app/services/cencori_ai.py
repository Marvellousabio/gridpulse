"""Cencori AI Gateway — rebalance reasoning via OpenAI-compatible API."""

from __future__ import annotations

import json
import logging
import re
from typing import Any, AsyncIterator

import httpx

from app.config import settings

logger = logging.getLogger("gridpulse.cencori")

CENCORI_OPENAI_BASE = "https://api.cencori.com/v1"
CENCORI_NATIVE_BASE = "https://cencori.com"

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


def cencori_enabled() -> bool:
    reasoning = settings.ai_reasoning or settings.claude_reasoning
    return bool(reasoning and settings.cencori_api_key)


def _extract_json(text: str) -> dict[str, Any]:
    text = text.strip()
    if text.startswith("{"):
        return json.loads(text)
    match = re.search(r"\{[\s\S]*\}", text)
    if not match:
        raise ValueError("No JSON object in model response")
    return json.loads(match.group())


def _openai_headers() -> dict[str, str]:
    return {
        "Authorization": f"Bearer {settings.cencori_api_key}",
        "Content-Type": "application/json",
    }


def _native_headers() -> dict[str, str]:
    headers = {"CENCORI_API_KEY": settings.cencori_api_key, "Content-Type": "application/json"}
    if settings.cencori_agent_id:
        headers["X-Agent-ID"] = settings.cencori_agent_id
    return headers


def _model() -> str:
    return settings.cencori_model or settings.anthropic_model


async def chat_completion(
    messages: list[dict[str, str]],
    *,
    stream: bool = False,
    temperature: float = 0.2,
    max_tokens: int = 1024,
) -> dict[str, Any]:
    """OpenAI-compatible chat via Cencori gateway (non-streaming)."""
    if not settings.cencori_api_key:
        raise RuntimeError("CENCORI_API_KEY is not configured")

    body = {
        "model": _model(),
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
        "stream": False,
    }

    async with httpx.AsyncClient(timeout=45.0) as client:
        response = await client.post(
            f"{CENCORI_OPENAI_BASE}/chat/completions",
            headers=_openai_headers(),
            json=body,
        )
        response.raise_for_status()
        return response.json()


async def chat_completion_stream(
    messages: list[dict[str, str]],
    *,
    temperature: float = 0.2,
    max_tokens: int = 1024,
) -> AsyncIterator[str]:
    if not settings.cencori_api_key:
        raise RuntimeError("CENCORI_API_KEY is not configured")

    body = {
        "model": _model(),
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
        "stream": True,
    }
    async for delta in _stream_openai_chat(body):
        yield delta


async def _stream_openai_chat(body: dict[str, Any]) -> AsyncIterator[str]:
    async with httpx.AsyncClient(timeout=60.0) as client:
        async with client.stream(
            "POST",
            f"{CENCORI_OPENAI_BASE}/chat/completions",
            headers=_openai_headers(),
            json=body,
        ) as response:
            response.raise_for_status()
            async for line in response.aiter_lines():
                if not line.startswith("data: "):
                    continue
                payload = line[6:].strip()
                if payload == "[DONE]":
                    break
                try:
                    chunk = json.loads(payload)
                    delta = chunk["choices"][0]["delta"].get("content") or ""
                    if delta:
                        yield delta
                except (json.JSONDecodeError, KeyError, IndexError):
                    continue


async def native_chat(messages: list[dict[str, str]], *, stream: bool = False) -> dict[str, Any]:
    """Native Cencori HTTP chat endpoint."""
    body = {"model": _model(), "messages": messages, "stream": stream}
    async with httpx.AsyncClient(timeout=45.0) as client:
        response = await client.post(
            f"{CENCORI_NATIVE_BASE}/api/ai/chat",
            headers=_native_headers(),
            json=body,
        )
        response.raise_for_status()
        return response.json()


async def analyze_cluster_rebalance(
    cluster_id: str,
    nodes: list[dict[str, Any]],
    fleet_context: dict[str, Any],
) -> dict[str, Any] | None:
    """Non-streaming rebalance decision via Cencori."""
    if not cencori_enabled():
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

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {
            "role": "user",
            "content": (
                "Analyze this Lagos cluster telemetry after a grid failure. "
                "Recommend cross-chemistry reroute if appropriate.\n\n"
                + json.dumps(user_payload, indent=2)
            ),
        },
    ]

    try:
        data = await chat_completion(messages)
        assert isinstance(data, dict)
        text = data["choices"][0]["message"]["content"]
        parsed = _extract_json(text)
        logger.info(
            "Cencori rebalance decision for %s: %s vehicles",
            cluster_id,
            parsed.get("vehiclesToReroute"),
        )
        return parsed
    except Exception as exc:
        logger.warning("Cencori rebalance unavailable, using fallback: %s", exc)
        return None


async def stream_reasoning_trace(prompt: str) -> AsyncIterator[str]:
    """Stream a short agent reasoning narrative for demo terminals."""
    messages = [
        {
            "role": "system",
            "content": "You are GridPulse Balancer. Respond in 5 short lines prefixed ASSESS:, FORECAST:, ALLOCATE:, REROUTE:, SETTLE:.",
        },
        {"role": "user", "content": prompt},
    ]
    async for delta in chat_completion_stream(messages, max_tokens=512):
        yield delta
