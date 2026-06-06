from __future__ import annotations

import hashlib
import uuid
from datetime import datetime, timezone
from typing import Any, TypedDict

from langgraph.graph import END, StateGraph

from app.services.gateway import route_agent_payload
from app.services.state import app_state


class BalancerState(TypedDict):
    telemetry: list[dict[str, Any]]
    alerts: list[str]
    actions: list[dict[str, Any]]
    terminal_messages: list[dict[str, Any]]
    ledger_entries: list[dict[str, Any]]
    cycle_id: str


def _now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")


def _fake_tx_hash(cycle_id: str, index: int) -> str:
    digest = hashlib.sha256(f"{cycle_id}:{index}".encode()).hexdigest()
    return f"0x{digest[:64]}"


def evaluate_state(state: BalancerState) -> BalancerState:
    alerts: list[str] = []
    for station in state["telemetry"]:
        if station["type"] != "Lithium_Swap":
            continue
        grid_down = not station.get("grid_active", True)
        batteries = station.get("available_batteries") or 0
        soc = station.get("solar_soc_pct") or 0
        if grid_down:
            alerts.append(
                f"Grid outage at {station['station_id']} ({station['location']}): "
                f"solar SOC {soc}%, {batteries} batteries remaining"
            )
        elif batteries <= 3:
            alerts.append(
                f"Low lithium inventory at {station['station_id']}: only {batteries} packs available"
            )
    state["alerts"] = alerts
    return state


def resolve_routing(state: BalancerState) -> BalancerState:
    actions: list[dict[str, Any]] = []
    lithium_stressed = [
        s for s in state["telemetry"]
        if s["type"] == "Lithium_Swap" and (not s.get("grid_active") or (s.get("available_batteries") or 0) <= 3)
    ]
    h2_surplus = [
        s for s in state["telemetry"]
        if s["type"] == "H2_Canister" and (s.get("available_canisters") or 0) >= 5
    ]

    if lithium_stressed and h2_surplus:
        source = lithium_stressed[0]
        target = max(h2_surplus, key=lambda s: s.get("available_canisters") or 0)
        rerouted = min(14, max(4, (target.get("available_canisters") or 8) * 2))
        preserved = max(1, source.get("available_batteries") or 2)
        actions.append(
            {
                "timestamp": _now(),
                "action_type": "cross_asset_reroute",
                "source_station": source["station_id"],
                "target_station": target["station_id"],
                "vehicles_rerouted": rerouted,
                "kwh_equivalent": round(rerouted * 1.8, 2),
                "message": (
                    f"Autonomously rerouted {rerouted} dual-power vehicles to {target['station_id']}. "
                    f"Preserved {preserved} pure-BEV lithium packs at {source['station_id']}."
                ),
            }
        )
    state["actions"] = actions
    return state


def execute_actions(state: BalancerState) -> BalancerState:
    terminal_messages: list[dict[str, Any]] = []
    ledger_entries: list[dict[str, Any]] = []

    for alert in state["alerts"]:
        terminal_messages.append(
            {
                "timestamp": _now(),
                "message": f"🚨 Alert: {alert}. Initiating cross-asset load balancing.",
                "type": "warning",
            }
        )

    for idx, action in enumerate(state["actions"]):
        terminal_messages.append(
            {
                "timestamp": _now(),
                "message": f"🤖 Action: {action['message']}",
                "type": "success",
            }
        )
        ledger_entries.append(
            {
                "tx_hash": _fake_tx_hash(state["cycle_id"], idx),
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "operator_from": action["source_station"],
                "operator_to": action["target_station"] or "N/A",
                "kwh_equivalent": action["kwh_equivalent"],
                "amount_ngn": round(action["kwh_equivalent"] * 185.0, 2),
                "status": "confirmed",
                "description": action["message"],
            }
        )

    if not state["actions"] and not state["alerts"]:
        terminal_messages.append(
            {
                "timestamp": _now(),
                "message": "✅ GridPulse Balancer: all nodes within SLA thresholds.",
                "type": "info",
            }
        )

    state["terminal_messages"] = terminal_messages
    state["ledger_entries"] = ledger_entries
    return state


def build_balancer_graph():
    graph = StateGraph(BalancerState)
    graph.add_node("evaluate_state", evaluate_state)
    graph.add_node("resolve_routing", resolve_routing)
    graph.add_node("execute_actions", execute_actions)
    graph.set_entry_point("evaluate_state")
    graph.add_edge("evaluate_state", "resolve_routing")
    graph.add_edge("resolve_routing", "execute_actions")
    graph.add_edge("execute_actions", END)
    return graph.compile()


_balancer = build_balancer_graph()


async def run_balancer_cycle(
    telemetry: list[dict[str, Any]] | None = None,
    force_scenario: str | None = None,
) -> dict[str, Any]:
    from app.services.telemetry import apply_telemetry_snapshot

    if telemetry is None:
        telemetry = await apply_telemetry_snapshot(force_scenario)

    cycle_id = str(uuid.uuid4())
    initial: BalancerState = {
        "telemetry": telemetry,
        "alerts": [],
        "actions": [],
        "terminal_messages": [],
        "ledger_entries": [],
        "cycle_id": cycle_id,
    }

    routed = await route_agent_payload({"cycle_id": cycle_id, "telemetry": telemetry})
    if routed.get("telemetry"):
        initial["telemetry"] = routed["telemetry"]

    result = _balancer.invoke(initial)

    persisted_logs = []
    for msg in result["terminal_messages"]:
        persisted_logs.append(await app_state.append_terminal_log(msg["message"], msg["type"]))

    persisted_actions = []
    for action in result["actions"]:
        persisted_actions.append(await app_state.append_agent_action(action))

    persisted_ledger = []
    for entry in result["ledger_entries"]:
        persisted_ledger.append(await app_state.append_ledger_entry(entry))

    if result["actions"]:
        settlement = {
            "id": str(len(app_state.settlements) + 1),
            "date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
            "amount": sum(e["amount_ngn"] for e in persisted_ledger),
            "status": "completed",
            "provider": "GridPulse Cross-Asset SLA",
            "reference": f"TXN-AGENT-{cycle_id[:8].upper()}",
        }
        app_state.settlements.insert(0, settlement)

    await app_state.increment_agent_cycles()

    return {
        "cycle_id": cycle_id,
        "status": "completed",
        "alerts": result["alerts"],
        "actions": persisted_actions,
        "terminal_logs": persisted_logs,
        "ledger_entries": persisted_ledger,
    }
