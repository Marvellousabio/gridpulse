from __future__ import annotations

import asyncio
import copy
from datetime import datetime, timezone
from typing import Any

from app.data import seed
from app.data.nodes_seed import CLUSTERS, NODES_SEED
from app.services.eliza_settlement import enrich_intent

STATION_ID_TO_MAP: dict[str, int] = {
    "ST-01": 1,
    "ST-02": 2,
    "ST-03": 4,
}


class AppState:
    """Thread-safe in-memory store for live demo / hackathon MVP."""

    def __init__(self) -> None:
        self._lock = asyncio.Lock()
        self.kpi = copy.deepcopy(seed.KPI_DATA)
        self.energy_forecast = copy.deepcopy(seed.ENERGY_FORECAST)
        self.distribution = copy.deepcopy(seed.DISTRIBUTION)
        self.map_stations = copy.deepcopy(seed.MAP_STATIONS)
        self.terminal_logs = copy.deepcopy(seed.TERMINAL_LOGS)
        self.settlements = copy.deepcopy(seed.SETTLEMENTS)
        self.top_performers = copy.deepcopy(seed.TOP_PERFORMERS)
        self.monitoring_metrics = copy.deepcopy(seed.MONITORING_METRICS)
        self.infrastructure_details = copy.deepcopy(seed.INFRASTRUCTURE_DETAILS)
        self.transactions = copy.deepcopy(seed.TRANSACTIONS)
        self.partners = copy.deepcopy(seed.PARTNERS)
        self.scheduled_events = copy.deepcopy(seed.SCHEDULED_EVENTS)
        self.analytics = copy.deepcopy(seed.ANALYTICS)
        self.settings = copy.deepcopy(seed.SETTINGS)
        self.faqs = copy.deepcopy(seed.FAQS)
        self.telemetry: list[dict[str, Any]] = copy.deepcopy(seed.TELEMETRY_BASELINE)
        self.agent_actions: list[dict[str, Any]] = []
        self.onchain_ledger: list[dict[str, Any]] = []
        self.agent_cycles_run = 0
        self.grid_nodes: list[dict[str, Any]] = copy.deepcopy(NODES_SEED)
        self.failed_cluster: str | None = None
        self.rebalance_runs: dict[str, dict[str, Any]] = {}
        self.v1_settlements: list[dict[str, Any]] = [
            enrich_intent(
                {
                    "intentId": "INT-SEED-001",
                    "payer": "OP-FRANCHISE-008",
                    "payee": "OP-FRANCHISE-033",
                    "kwhEq": 18.4,
                    "status": "CLEARED",
                    "proofRef": "0xseedproof8f2a9c1d4e7b3a6f0c5d8e2a1b4c7d9",
                    "clearedAt": datetime.now(timezone.utc).isoformat(),
                    "txHash": "0xseedelizatx9f2a8c1d4e7b3a6f0c5d8e2a1b4c7d9e0f1a2",
                }
            )
        ]
        self.clean_energy_records: list[dict[str, Any]] = [
            {
                "recordId": "CER-SEED-001",
                "nodeId": "GP-LAG-LEK-007",
                "kwhEq": 12.5,
                "cleanFractionPct": 74,
                "source": "GRID",
                "settledAt": datetime.now(timezone.utc).isoformat(),
                "proofRef": "0xseedclean4a2f8c9d1e3b5a7c0d2e4f6a8b0c2d4",
            }
        ]
        self.last_checkpoint: str = datetime.now(timezone.utc).isoformat()
        self._log_id_counter = len(self.terminal_logs) + 1
        self._action_id_counter = 1
        self._ledger_id_counter = 1
        self._settlement_id_counter = len(self.settlements) + 1
        self._ws_subscribers: list[asyncio.Queue] = []

    def now_ts(self) -> str:
        return datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")

    async def snapshot(self, attr: str) -> Any:
        async with self._lock:
            return copy.deepcopy(getattr(self, attr))

    async def append_terminal_log(self, message: str, log_type: str = "info") -> dict[str, Any]:
        async with self._lock:
            entry = {
                "id": self._log_id_counter,
                "timestamp": self.now_ts(),
                "message": message,
                "type": log_type,
            }
            self._log_id_counter += 1
            self.terminal_logs.insert(0, entry)
            self.terminal_logs = self.terminal_logs[:100]
        await self._broadcast({"event": "terminal_log", "data": entry})
        return entry

    async def append_agent_action(self, action: dict[str, Any]) -> dict[str, Any]:
        async with self._lock:
            stored = copy.deepcopy(action)
            stored["id"] = f"ACT-{self._action_id_counter:04d}"
            self._action_id_counter += 1
            self.agent_actions.insert(0, stored)
            self.agent_actions = self.agent_actions[:50]
        await self._broadcast({"event": "agent_action", "data": stored})
        return stored

    async def append_ledger_entry(self, entry: dict[str, Any]) -> dict[str, Any]:
        async with self._lock:
            stored = copy.deepcopy(entry)
            stored["id"] = f"LED-{self._ledger_id_counter:04d}"
            self._ledger_id_counter += 1
            self.onchain_ledger.insert(0, stored)
            self.onchain_ledger = self.onchain_ledger[:100]
        await self._broadcast({"event": "ledger_entry", "data": stored})
        return stored

    async def append_settlement(self, settlement: dict[str, Any]) -> dict[str, Any]:
        async with self._lock:
            stored = copy.deepcopy(settlement)
            stored["id"] = str(self._settlement_id_counter)
            self._settlement_id_counter += 1
            self.settlements.insert(0, stored)
            self.settlements = self.settlements[:100]
        return stored

    async def set_telemetry(self, readings: list[dict[str, Any]]) -> None:
        async with self._lock:
            self.telemetry = copy.deepcopy(readings)
            now = datetime.now(timezone.utc).isoformat()
            for station in self.telemetry:
                station["timestamp"] = now
            self._sync_map_from_telemetry_locked()

    def _sync_map_from_telemetry_locked(self) -> None:
        for reading in self.telemetry:
            map_id = STATION_ID_TO_MAP.get(reading["station_id"])
            if map_id is None:
                continue
            for station in self.map_stations:
                if station["id"] != map_id:
                    continue
                if reading["type"] == "Lithium_Swap":
                    batteries = int(reading.get("available_batteries") or 0)
                    station["load"] = min(100, max(0, round((1 - batteries / 12) * 100)))
                    if not reading.get("grid_active", True):
                        station["status"] = "maintenance"
                    elif batteries <= 2:
                        station["status"] = "maintenance"
                    else:
                        station["status"] = "active"
                elif reading["type"] == "H2_Canister":
                    canisters = int(reading.get("available_canisters") or 0)
                    station["load"] = min(100, max(0, round((1 - canisters / 16) * 100)))
                    station["status"] = "active" if canisters >= 2 else "maintenance"

    async def increment_agent_cycles(self) -> None:
        async with self._lock:
            self.agent_cycles_run += 1

    def subscribe(self) -> asyncio.Queue:
        queue: asyncio.Queue = asyncio.Queue(maxsize=100)
        self._ws_subscribers.append(queue)
        return queue

    def unsubscribe(self, queue: asyncio.Queue) -> None:
        if queue in self._ws_subscribers:
            self._ws_subscribers.remove(queue)

    async def _broadcast(self, payload: dict[str, Any]) -> None:
        for queue in list(self._ws_subscribers):
            try:
                queue.put_nowait(payload)
            except asyncio.QueueFull:
                pass

    async def list_grid_nodes(self) -> list[dict[str, Any]]:
        async with self._lock:
            now = datetime.now(timezone.utc).isoformat()
            return [{**copy.deepcopy(n), "updatedAt": now} for n in self.grid_nodes]

    async def get_grid_node(self, node_id: str) -> dict[str, Any] | None:
        async with self._lock:
            for node in self.grid_nodes:
                if node["node"]["nodeId"] == node_id:
                    return {**copy.deepcopy(node), "updatedAt": datetime.now(timezone.utc).isoformat()}
        return None

    async def cluster_availability(self) -> list[dict[str, Any]]:
        async with self._lock:
            rows = []
            for cluster_id in CLUSTERS:
                cluster_nodes = [n for n in self.grid_nodes if n["node"]["geo"]["cluster"] == cluster_id]
                grid_available = (
                    False
                    if self.failed_cluster == cluster_id
                    else all(n["node"]["powerSource"]["gridAvailable"] for n in cluster_nodes)
                )
                by_chemistry = {"LITHIUM_SWAP": 0.0, "HYDROGEN_HUB": 0.0}
                available = 0.0
                for node in cluster_nodes:
                    available += float(node["availableKwhEq"])
                    by_chemistry[node["node"]["assetClass"]] += float(node["availableKwhEq"])
                rows.append(
                    {
                        "clusterId": cluster_id,
                        "gridAvailable": grid_available,
                        "nodes": len(cluster_nodes),
                        "availableKwhEq": round(available),
                        "byChemistry": {
                            "LITHIUM_SWAP": round(by_chemistry["LITHIUM_SWAP"]),
                            "HYDROGEN_HUB": round(by_chemistry["HYDROGEN_HUB"]),
                        },
                    }
                )
            return rows

    async def cluster_nodes_for_rebalance(self, cluster_id: str) -> list[dict[str, Any]]:
        async with self._lock:
            return copy.deepcopy(
                [n for n in self.grid_nodes if n["node"]["geo"]["cluster"] == cluster_id]
            )

    async def mark_cluster_grid_failure(self, cluster_id: str) -> None:
        async with self._lock:
            self.failed_cluster = cluster_id
            for node in self.grid_nodes:
                if node["node"]["geo"]["cluster"] != cluster_id:
                    continue
                if node["node"]["assetClass"] == "LITHIUM_SWAP":
                    node["node"]["powerSource"]["gridAvailable"] = False
                    node["node"]["powerSource"]["currentSource"] = "SOLAR_PV"
                    node["availableKwhEq"] = min(node["availableKwhEq"], 14)
                    node["health"]["lastFault"] = "GRID_OUTAGE"

    async def create_rebalance_run(self, run_id: str, cluster_id: str) -> None:
        async with self._lock:
            self.rebalance_runs[run_id] = {
                "cluster_id": cluster_id,
                "started_at": datetime.now(timezone.utc).timestamp(),
                "started_iso": datetime.now(timezone.utc).isoformat(),
                "final": None,
                "applied": False,
            }

    async def set_rebalance_final(self, run_id: str, final: dict[str, Any]) -> None:
        async with self._lock:
            if run_id in self.rebalance_runs:
                self.rebalance_runs[run_id]["final"] = copy.deepcopy(final)

    async def get_rebalance_run(self, run_id: str) -> dict[str, Any] | None:
        async with self._lock:
            run = self.rebalance_runs.get(run_id)
            return copy.deepcopy(run) if run else None

    async def mark_rebalance_applied(self, run_id: str) -> None:
        async with self._lock:
            if run_id in self.rebalance_runs:
                self.rebalance_runs[run_id]["applied"] = True

    async def apply_rebalance_outcome(self, final: dict[str, Any]) -> None:
        async with self._lock:
            cluster_id = final["trigger"]["clusterId"]
            self.failed_cluster = cluster_id
            for node in self.grid_nodes:
                if node["node"]["geo"]["cluster"] != cluster_id:
                    continue
                if node["node"]["assetClass"] == "LITHIUM_SWAP":
                    node["node"]["powerSource"]["gridAvailable"] = False
                    node["node"]["powerSource"]["currentSource"] = "SOLAR_PV"
                    node["availableKwhEq"] = 14
                else:
                    node["availableKwhEq"] = max(80, float(node["availableKwhEq"]) - 25)

            for intent in final.get("settlement", {}).get("intents", []):
                self.v1_settlements.insert(0, copy.deepcopy(intent))

            reroute = (final.get("decision", {}).get("reroutes") or [{}])[0]
            h2_node = reroute.get("toNode", "GP-LAG-IKJ-022")
            intent = (final.get("settlement", {}).get("intents") or [{}])[0]
            self.clean_energy_records.insert(
                0,
                {
                    "recordId": f"CER-{final['runId'][:8]}",
                    "nodeId": h2_node,
                    "kwhEq": intent.get("kwhEq", 25.2),
                    "cleanFractionPct": 88,
                    "source": "SOLAR_PV",
                    "settledAt": datetime.now(timezone.utc).isoformat(),
                    "proofRef": intent.get("proofRef", ""),
                },
            )

    async def list_v1_settlements(self) -> list[dict[str, Any]]:
        async with self._lock:
            return copy.deepcopy(self.v1_settlements)

    async def list_clean_energy(self) -> list[dict[str, Any]]:
        async with self._lock:
            return copy.deepcopy(self.clean_energy_records)

    async def set_last_checkpoint(self, ts: str) -> None:
        async with self._lock:
            self.last_checkpoint = ts

    async def ingest_telemetry_v1(self, payload: dict[str, Any]) -> dict[str, Any]:
        async with self._lock:
            node_id = payload.get("nodeId") or payload.get("node", {}).get("nodeId")
            if not node_id:
                raise ValueError("nodeId required")
            for node in self.grid_nodes:
                if node["node"]["nodeId"] != node_id:
                    continue
                if "availableKwhEq" in payload:
                    node["availableKwhEq"] = float(payload["availableKwhEq"])
                ps = payload.get("powerSource")
                if ps:
                    node["node"]["powerSource"].update(ps)
                node["updatedAt"] = datetime.now(timezone.utc).isoformat()
                return {"accepted": True, "nodeId": node_id, "messageId": payload.get("messageId")}
            raise ValueError(f"Unknown node {node_id}")

    async def append_v1_settlement(self, intent: dict[str, Any]) -> dict[str, Any]:
        async with self._lock:
            stored = copy.deepcopy(enrich_intent(intent))
            self.v1_settlements.insert(0, stored)
            return stored

    async def get_v1_settlement(self, intent_id: str) -> dict[str, Any] | None:
        async with self._lock:
            for intent in self.v1_settlements:
                if intent.get("intentId") == intent_id:
                    return copy.deepcopy(intent)
        return None

    async def update_v1_settlement(self, intent_id: str, intent: dict[str, Any]) -> dict[str, Any]:
        async with self._lock:
            for idx, row in enumerate(self.v1_settlements):
                if row.get("intentId") == intent_id:
                    self.v1_settlements[idx] = copy.deepcopy(intent)
                    return copy.deepcopy(intent)
            self.v1_settlements.insert(0, copy.deepcopy(intent))
            return copy.deepcopy(intent)


app_state = AppState()
