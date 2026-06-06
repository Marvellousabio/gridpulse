"""Cencori AI routes — non-streaming and SSE streaming chat."""

from __future__ import annotations

import json
from typing import Any

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from app.services.cencori_ai import chat_completion, chat_completion_stream, cencori_enabled, native_chat

router = APIRouter(prefix="/api/ai", tags=["cencori"])


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    model: str | None = None
    stream: bool = False
    temperature: float = 0.2
    max_tokens: int = 512


class RebalancePromptRequest(BaseModel):
    clusterId: str
    prompt: str = Field(
        default="Summarize grid failure response for Ikeja in one sentence.",
    )


@router.get("/status")
async def cencori_status():
    from app.services.cencori_ai import CENCORI_OPENAI_BASE

    return {
        "enabled": cencori_enabled(),
        "openaiBaseUrl": CENCORI_OPENAI_BASE,
    }


@router.post("/chat")
async def ai_chat(body: ChatRequest):
    if not cencori_enabled():
        raise HTTPException(status_code=503, detail="CENCORI_API_KEY not configured")

    messages = [m.model_dump() for m in body.messages]
    if body.stream:

        async def event_stream():
            async for delta in chat_completion_stream(
                messages,
                temperature=body.temperature,
                max_tokens=body.max_tokens,
            ):
                yield f"data: {json.dumps({'delta': delta})}\n\n"
            yield "data: [DONE]\n\n"

        return StreamingResponse(event_stream(), media_type="text/event-stream")

    data = await chat_completion(
        messages,
        temperature=body.temperature,
        max_tokens=body.max_tokens,
    )
    return data


@router.post("/reason/stream")
async def reason_stream(body: RebalancePromptRequest):
    if not cencori_enabled():
        raise HTTPException(status_code=503, detail="CENCORI_API_KEY not configured")

    messages = [
        {
            "role": "system",
            "content": "You are GridPulse Balancer. Stream 5 short lines: ASSESS, FORECAST, ALLOCATE, REROUTE, SETTLE.",
        },
        {
            "role": "user",
            "content": f"Cluster {body.clusterId}: {body.prompt}",
        },
    ]

    async def event_stream():
        async for delta in chat_completion_stream(messages, max_tokens=512):
            yield f"data: {json.dumps({'delta': delta})}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")


@router.post("/smoke")
async def smoke_native():
    """Non-streaming native Cencori chat smoke test."""
    if not cencori_enabled():
        raise HTTPException(status_code=503, detail="CENCORI_API_KEY not configured")
    result = await native_chat(
        messages=[{"role": "user", "content": "Reply with exactly: GridPulse Cencori OK"}],
        stream=False,
    )
    return {"ok": True, "response": result}
