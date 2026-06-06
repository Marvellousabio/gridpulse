from __future__ import annotations

import asyncio
import copy
from datetime import datetime, timezone
from typing import Any

from app.data import seed

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


app_state = AppState()
