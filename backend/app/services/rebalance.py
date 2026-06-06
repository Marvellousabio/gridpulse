"""Rebalance runs — phased orchestration with optional Claude reasoning."""

from __future__ import annotations

import asyncio
import copy
import hashlib
import uuid
from datetime import datetime, timezone
from typing import Any

from app.data.nodes_seed import GRAPH_PHASES
from app.services.claude import analyze_cluster_rebalance
from app.services.cencori_ai import cencori_enabled
from app.services.eliza_settlement import clear_intent, enrich_intent, verify_intent
from app.services.state import app_state

PHASE_MS = 700


def _iso_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _telemetry_proof_hash(cluster_id: str, nodes: list[dict[str, Any]]) -> str:
    payload = cluster_id + "|".join(
        f"{n['node']['nodeId']}:{n['availableKwhEq']}:{n['node']['powerSource']['gridAvailable']}"
        for n in sorted(nodes, key=lambda x: x["node"]["nodeId"])
    )
    digest = hashlib.sha256(payload.encode()).hexdigest()
    return f"0xproof{digest[:40]}"


async def _rule_fallback(
    cluster_id: str,
    nodes: list[dict[str, Any]],
    run_id: str,
    all_nodes: list[dict[str, Any]] | None = None,
) -> dict[str, Any]:
    lithium = [n for n in nodes if n["node"]["assetClass"] == "LITHIUM_SWAP"]
    hydrogen = [n for n in nodes if n["node"]["assetClass"] == "HYDROGEN_HUB"]
    li_stressed = min(lithium, key=lambda n: n["availableKwhEq"], default=None)
    h2_target = max(hydrogen, key=lambda n: n["availableKwhEq"], default=None) if hydrogen else None

    if not li_stressed:
        raise ValueError(f"Cluster {cluster_id} has no lithium node")

    if h2_target is None:
        pool = all_nodes or await app_state.list_grid_nodes()
        h2_nodes = [n for n in pool if n["node"]["assetClass"] == "HYDROGEN_HUB"]
        if not h2_nodes:
            raise ValueError("No hydrogen hub in network")
        h2_target = max(h2_nodes, key=lambda n: n["availableKwhEq"])

    vehicles = min(14, max(4, int(h2_target["availableKwhEq"] / 8)))
    kwh_eq = round(vehicles * 1.8, 2)
    proof = _telemetry_proof_hash(cluster_id, nodes)

    return {
        "depletionHorizonMin": 18,
        "demandSpikeFactor": 1.34,
        "confidence": 0.91,
        "vehiclesToReroute": vehicles,
        "targetNodeId": h2_target["node"]["nodeId"],
        "crossChemistry": True,
        "loadShiftNodeId": li_stressed["node"]["nodeId"],
        "loadShiftSource": "SOLAR_PV",
        "humanApprovalRequired": kwh_eq > 50,
        "kwhEqSettlement": kwh_eq,
        "reasoningTrace": [
            f"ASSESS: Grid failure detected in {cluster_id} — lithium bays at critical SOC.",
            "FORECAST: Depletion horizon 18 min; demand spike factor 1.34 on dual-power okada fleet.",
            f"ALLOCATE: Chemistry-blind allocator selected H2 hub — {h2_target['availableKwhEq']} kWh-eq surplus.",
            f"REROUTE: {vehicles} dual-power vehicles committed to {h2_target['node']['nodeId']}; pure-BEV packs reserved.",
            "SETTLE: Cross-operator intent cleared against signed IoT hardware proof.",
        ],
        "proofRef": proof,
        "sourceOperator": li_stressed["node"]["operatorId"],
        "targetOperator": h2_target["node"]["operatorId"],
        "lithiumNodeId": li_stressed["node"]["nodeId"],
        "run_id": run_id,
    }


def _build_final_state(cluster_id: str, run_id: str, decision: dict[str, Any], nodes: list[dict[str, Any]]) -> dict[str, Any]:
    lithium = next(n for n in nodes if n["node"]["assetClass"] == "LITHIUM_SWAP")
    hydrogen = next((n for n in nodes if n["node"]["nodeId"] == decision["targetNodeId"]), None)
    if hydrogen is None:
        hydrogen = next(n for n in nodes if n["node"]["assetClass"] == "HYDROGEN_HUB")

    li_load = min(99, round(100 - lithium["availableKwhEq"] / 0.6))
    h2_load = min(99, round(100 - hydrogen["availableKwhEq"] / 1.2))

    agent_label = "gridpulse-balancer-cencori" if cencori_enabled() else "gridpulse-balancer-langgraph"

    return {
        "runId": run_id,
        "trigger": {
            "type": "GRID_FAILURE",
            "clusterId": cluster_id,
            "detectedAt": _iso_now(),
            "confidence": decision.get("confidence", 0.97),
        },
        "graphPhase": "DONE",
        "context": {
            "fleetAtRisk": [
                {
                    "fleetId": "FLEET-OKADA-DUAL-44",
                    "vehicles": decision["vehiclesToReroute"],
                    "avgRangeKmRemaining": 8,
                    "chemistry": "LITHIUM",
                }
            ],
            "candidateNodes": [
                {
                    "nodeId": lithium["node"]["nodeId"],
                    "assetClass": "LITHIUM_SWAP",
                    "availableKwhEq": lithium["availableKwhEq"],
                    "etaMin": 4,
                    "loadPct": li_load,
                },
                {
                    "nodeId": hydrogen["node"]["nodeId"],
                    "assetClass": "HYDROGEN_HUB",
                    "availableKwhEq": hydrogen["availableKwhEq"],
                    "etaMin": 6,
                    "loadPct": h2_load,
                },
            ],
        },
        "forecast": {
            "depletionHorizonMin": decision["depletionHorizonMin"],
            "demandSpikeFactor": decision["demandSpikeFactor"],
            "model": "cencori-rebalance" if cencori_enabled() else "gridpulse-forecast-v1",
        },
        "decision": {
            "reroutes": [
                {
                    "fleetId": "FLEET-OKADA-DUAL-44",
                    "toNode": decision["targetNodeId"],
                    "units": decision["vehiclesToReroute"],
                    "crossChemistry": decision.get("crossChemistry", True),
                }
            ],
            "loadShifts": (
                [{"nodeId": decision["loadShiftNodeId"], "powerSource": decision["loadShiftSource"]}]
                if decision.get("loadShiftNodeId") and decision.get("loadShiftSource")
                else []
            ),
            "humanApprovalRequired": decision.get("humanApprovalRequired", False),
        },
        "settlement": {
            "intents": [
                enrich_intent(
                    {
                        "intentId": f"INT-{run_id[:8]}",
                        "payer": decision.get("sourceOperator", lithium["node"]["operatorId"]),
                        "payee": decision.get("targetOperator", hydrogen["node"]["operatorId"]),
                        "kwhEq": decision["kwhEqSettlement"],
                        "status": "PENDING_PROOF",
                        "proofRef": decision.get("proofRef", _telemetry_proof_hash(cluster_id, nodes)),
                    }
                )
            ]
        },
        "audit": {
            "agent": agent_label,
            "reasoningTrace": decision["reasoningTrace"],
            "checkpoint": f"DDB#REBAL#{run_id[:12]}",
        },
    }


async def _resolve_decision(cluster_id: str, nodes: list[dict[str, Any]], run_id: str) -> dict[str, Any]:
    fleet_context = {
        "fleetId": "FLEET-OKADA-DUAL-44",
        "vehicles": 14,
        "avgRangeKmRemaining": 8,
        "chemistry": "LITHIUM",
    }
    all_nodes = await app_state.list_grid_nodes()
    claude_result = await analyze_cluster_rebalance(cluster_id, nodes, fleet_context)
    if claude_result:
        proof = _telemetry_proof_hash(cluster_id, nodes)
        lithium = next(n for n in nodes if n["node"]["assetClass"] == "LITHIUM_SWAP")
        hydrogen = next(
            (n for n in all_nodes if n["node"]["nodeId"] == claude_result.get("targetNodeId")),
            next((n for n in all_nodes if n["node"]["assetClass"] == "HYDROGEN_HUB"), None),
        )
        if hydrogen is None:
            return await _rule_fallback(cluster_id, nodes, run_id, all_nodes)
        claude_result.setdefault("proofRef", proof)
        claude_result.setdefault("sourceOperator", lithium["node"]["operatorId"])
        claude_result.setdefault("targetOperator", hydrogen["node"]["operatorId"])
        claude_result.setdefault("lithiumNodeId", lithium["node"]["nodeId"])
        claude_result["run_id"] = run_id
        return claude_result
    return await _rule_fallback(cluster_id, nodes, run_id, all_nodes)


async def _prepare_run(cluster_id: str, run_id: str) -> None:
    nodes = await app_state.cluster_nodes_for_rebalance(cluster_id)
    decision = await _resolve_decision(cluster_id, nodes, run_id)
    final = _build_final_state(cluster_id, run_id, decision, nodes)
    await app_state.set_rebalance_final(run_id, final)
    await app_state.set_last_checkpoint(_iso_now())


async def trigger_rebalance(cluster_id: str) -> str:
    run_id = str(uuid.uuid4())
    nodes = await app_state.cluster_nodes_for_rebalance(cluster_id)
    await app_state.mark_cluster_grid_failure(cluster_id)
    await app_state.create_rebalance_run(run_id, cluster_id)
    asyncio.create_task(_prepare_run(cluster_id, run_id))
    return run_id


def _phase_at(elapsed_ms: float) -> str:
    idx = min(int(elapsed_ms / PHASE_MS), len(GRAPH_PHASES) - 1)
    return GRAPH_PHASES[idx]


async def get_rebalance_state(run_id: str) -> dict[str, Any]:
    run = await app_state.get_rebalance_run(run_id)
    if run is None:
        raise KeyError(run_id)

    elapsed = (datetime.now(timezone.utc).timestamp() - run["started_at"]) * 1000
    phase = _phase_at(elapsed)

    if run.get("final") is None:
        return {
            "runId": run_id,
            "trigger": {
                "type": "GRID_FAILURE",
                "clusterId": run["cluster_id"],
                "detectedAt": run["started_iso"],
                "confidence": 0.85,
            },
            "graphPhase": "ASSESS",
            "context": {"fleetAtRisk": [], "candidateNodes": []},
            "forecast": {"depletionHorizonMin": 0, "demandSpikeFactor": 1.0, "model": "pending"},
            "decision": {"reroutes": [], "loadShifts": [], "humanApprovalRequired": False},
            "settlement": {"intents": []},
            "audit": {
                "agent": "gridpulse-balancer-cencori" if cencori_enabled() else "gridpulse-balancer-langgraph",
                "reasoningTrace": ["ASSESS: Ingesting cluster telemetry and invoking reasoning engine..."],
                "checkpoint": f"DDB#REBAL#{run_id[:12]}",
            },
        }

    final = copy.deepcopy(run["final"])
    cluster_id = final["trigger"]["clusterId"]
    nodes = await app_state.cluster_nodes_for_rebalance(cluster_id)
    trace_count = min(
        len(final["audit"]["reasoningTrace"]),
        max(1, int(elapsed / PHASE_MS)),
    )
    rerouted = phase in ("REROUTE", "SETTLE", "DONE")

    if phase == "DONE" and elapsed >= PHASE_MS * (len(GRAPH_PHASES) - 1) and not run.get("applied"):
        cleared_final = copy.deepcopy(final)
        cleared_intents = []
        for intent in final["settlement"]["intents"]:
            row = enrich_intent(copy.deepcopy(intent))
            try:
                if row.get("status") != "CLEARED":
                    if row.get("status") != "PROOF_VERIFIED":
                        row = verify_intent(row, cluster_id, nodes)
                    row = clear_intent(row)
            except ValueError:
                row["status"] = "DISPUTED"
            cleared_intents.append(row)
        cleared_final["settlement"] = {"intents": cleared_intents}
        await app_state.set_rebalance_final(run_id, cleared_final)
        await app_state.apply_rebalance_outcome(cleared_final)
        await app_state.mark_rebalance_applied(run_id)
        final = cleared_final
        nodes = await app_state.cluster_nodes_for_rebalance(cluster_id)

    intents = []
    for intent in final["settlement"]["intents"]:
        row = enrich_intent(copy.deepcopy(intent))
        if row.get("status") == "CLEARED":
            intents.append(row)
            continue
        if phase == "DONE":
            try:
                if row.get("status") != "PROOF_VERIFIED":
                    row = verify_intent(row, cluster_id, nodes)
                row = clear_intent(row)
            except ValueError:
                row["status"] = "DISPUTED"
        elif phase == "SETTLE":
            try:
                row = verify_intent(row, cluster_id, nodes)
            except ValueError:
                row["status"] = "PENDING_PROOF"
        else:
            row["status"] = "PENDING_PROOF"
            row.pop("clearedAt", None)
            row.pop("txHash", None)
            if phase not in ("SETTLE", "DONE"):
                row.pop("proofRef", None)
        intents.append(row)

    return {
        **final,
        "graphPhase": phase,
        "decision": {
            **final["decision"],
            "reroutes": final["decision"]["reroutes"] if rerouted else [],
        },
        "settlement": {"intents": intents},
        "audit": {
            **final["audit"],
            "reasoningTrace": final["audit"]["reasoningTrace"][:trace_count],
        },
    }
