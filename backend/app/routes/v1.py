"""GridPulse SOW /v1 REST API."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from app.services.claude import claude_enabled
from app.services.rebalance import get_rebalance_state, trigger_rebalance
from app.services.state import app_state

router = APIRouter(prefix="/v1", tags=["v1"])


class RebalanceRequest(BaseModel):
    clusterId: str


class TelemetryIngestRequest(BaseModel):
    messageId: str | None = None
    nodeId: str
    availableKwhEq: float | None = None
    powerSource: dict[str, Any] | None = None


class SettlementIntentRequest(BaseModel):
    payer: str
    payee: str
    kwhEq: float
    proofRef: str


@router.get("/health")
async def v1_health():
    return {
        "ok": True,
        "lastCheckpoint": await app_state.snapshot("last_checkpoint"),
        "claudeEnabled": claude_enabled(),
        "service": "gridpulse-api",
    }


@router.get("/clusters/availability")
async def clusters_availability():
    return await app_state.cluster_availability()


@router.get("/clusters/{cluster_id}/availability")
async def cluster_availability(cluster_id: str):
    rows = await app_state.cluster_availability()
    for row in rows:
        if row["clusterId"] == cluster_id:
            return row
    raise HTTPException(status_code=404, detail=f"Cluster {cluster_id} not found")


@router.get("/nodes")
async def list_nodes():
    return await app_state.list_grid_nodes()


@router.get("/nodes/{node_id}/state")
async def node_state(node_id: str):
    node = await app_state.get_grid_node(node_id)
    if node is None:
        raise HTTPException(status_code=404, detail=f"Node {node_id} not found")
    return node


@router.post("/telemetry/ingest")
async def telemetry_ingest(body: TelemetryIngestRequest):
    try:
        return await app_state.ingest_telemetry_v1(body.model_dump(exclude_none=True))
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/orchestrate/rebalance")
async def orchestrate_rebalance(body: RebalanceRequest):
    run_id = await trigger_rebalance(body.clusterId)
    return {"runId": run_id}


@router.get("/orchestrate/rebalance/{run_id}")
async def orchestrate_rebalance_status(run_id: str):
    try:
        return await get_rebalance_state(run_id)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=f"Run {run_id} not found") from exc


@router.get("/fleets/{fleet_id}/routing-plan")
async def fleet_routing_plan(fleet_id: str):
    runs = await app_state.snapshot("rebalance_runs")
    for run in reversed(list(runs.values())):
        final = run.get("final")
        if not final:
            continue
        reroutes = final.get("decision", {}).get("reroutes", [])
        for r in reroutes:
            if r.get("fleetId") == fleet_id:
                return {
                    "fleetId": fleet_id,
                    "active": True,
                    "runId": final["runId"],
                    "reroutes": reroutes,
                    "clusterId": final["trigger"]["clusterId"],
                }
    return {"fleetId": fleet_id, "active": False, "reroutes": []}


@router.get("/settlements")
async def list_settlements():
    return await app_state.list_v1_settlements()


@router.post("/settlements/intent")
async def create_settlement_intent(body: SettlementIntentRequest):
    intent = {
        "intentId": f"INT-{body.payer[-3:]}-{body.payee[-3:]}",
        "payer": body.payer,
        "payee": body.payee,
        "kwhEq": body.kwhEq,
        "status": "PENDING_PROOF",
        "proofRef": body.proofRef,
    }
    return await app_state.append_v1_settlement(intent)


@router.get("/ledger/clean-energy")
async def clean_energy_ledger(
    from_date: str | None = Query(None, alias="from"),
    to: str | None = None,
):
    records = await app_state.list_clean_energy()
    if from_date or to:
        filtered = []
        for row in records:
            ts = row.get("settledAt", "")
            if from_date and ts < from_date:
                continue
            if to and ts > to:
                continue
            filtered.append(row)
        return filtered
    return records
