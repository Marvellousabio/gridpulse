from __future__ import annotations

import copy
import random
from datetime import datetime, timezone
from typing import Any

from app.data import seed
from app.services.state import app_state


def _stamp(readings: list[dict[str, Any]]) -> list[dict[str, Any]]:
    stamped = copy.deepcopy(readings)
    now = datetime.now(timezone.utc).isoformat()
    for row in stamped:
        row["timestamp"] = now
    return stamped


def generate_telemetry_snapshot(force_scenario: str | None = None) -> list[dict[str, Any]]:
    """Simulate polymorphic IoT payloads from Lagos swap + H2 hubs."""
    readings = copy.deepcopy(seed.TELEMETRY_BASELINE)

    if force_scenario == "grid_outage_yaba":
        for station in readings:
            if station["station_id"] == "ST-01":
                station["grid_active"] = False
                station["solar_soc_pct"] = max(5.0, (station.get("solar_soc_pct") or 42) - 15)
                station["available_batteries"] = max(1, (station.get("available_batteries") or 2))
            if station["station_id"] == "ST-02":
                station["hydrogen_psi"] = 1200.0
                station["available_canisters"] = 8
        return _stamp(readings)

    if force_scenario == "normal":
        for station in readings:
            if station["station_id"] == "ST-01":
                station["grid_active"] = True
                station["solar_soc_pct"] = 85.0
                station["available_batteries"] = 10
        return _stamp(readings)

    for station in readings:
        if station["type"] == "Lithium_Swap":
            station["grid_active"] = random.random() > 0.25
            soc = float(station.get("solar_soc_pct") or 50)
            station["solar_soc_pct"] = round(max(5.0, min(100.0, soc + random.uniform(-8, 5))), 1)
            batteries = int(station.get("available_batteries") or 4)
            station["available_batteries"] = max(0, min(12, batteries + random.randint(-1, 1)))
        elif station["type"] == "H2_Canister":
            psi = float(station.get("hydrogen_psi") or 1100)
            station["hydrogen_psi"] = round(max(800.0, min(1500.0, psi + random.uniform(-30, 30))), 1)
            canisters = int(station.get("available_canisters") or 6)
            station["available_canisters"] = max(0, min(16, canisters + random.randint(-1, 1)))

    return _stamp(readings)


async def apply_telemetry_snapshot(force_scenario: str | None = None) -> list[dict[str, Any]]:
    readings = generate_telemetry_snapshot(force_scenario)
    await app_state.set_telemetry(readings)
    return readings


def telemetry_needs_agent(readings: list[dict[str, Any]]) -> bool:
    for station in readings:
        if station["type"] != "Lithium_Swap":
            continue
        grid_down = not station.get("grid_active", True)
        low_soc = (station.get("solar_soc_pct") or 100) < 25
        low_inventory = (station.get("available_batteries") or 99) <= 3
        if grid_down and (low_soc or low_inventory):
            return True
    return False
