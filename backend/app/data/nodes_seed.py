"""SOW-aligned node registry — mirrors frontend mock seed (12 Lagos nodes)."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any


def _iso_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _lithium(
    node_id: str,
    cluster: str,
    operator_id: str,
    lat: float,
    lng: float,
    grid_available: bool,
    available_kwh_eq: float,
) -> dict[str, Any]:
    current_source = "GRID" if grid_available else "SOLAR_PV"
    return {
        "schemaVersion": "gridpulse.telemetry.v1",
        "node": {
            "nodeId": node_id,
            "operatorId": operator_id,
            "assetClass": "LITHIUM_SWAP",
            "geo": {"lat": lat, "lng": lng, "cluster": cluster},
            "powerSource": {
                "currentSource": current_source,
                "gridAvailable": grid_available,
                "fallbackChain": ["GRID", "SOLAR_PV", "DIESEL_GENSET"],
            },
        },
        "metrics": {
            "lithium": {
                "baysTotal": 12,
                "baysCharged": 7 if grid_available else 2,
                "baysCharging": 3 if grid_available else 1,
                "baysFaulted": 0 if grid_available else 1,
                "packs": [
                    {
                        "packId": f"{node_id}-P01",
                        "soc": 94,
                        "sohPct": 97,
                        "cellTempC": 31,
                        "packVoltage": 72.4,
                        "cycleCount": 412,
                        "estReadyInMin": 0,
                    },
                    {
                        "packId": f"{node_id}-P02",
                        "soc": 88,
                        "sohPct": 96,
                        "cellTempC": 33,
                        "packVoltage": 71.8,
                        "cycleCount": 388,
                        "estReadyInMin": 4,
                    },
                    {
                        "packId": f"{node_id}-P03",
                        "soc": 76 if grid_available else 18,
                        "sohPct": 95,
                        "cellTempC": 36,
                        "packVoltage": 70.2,
                        "cycleCount": 501,
                        "estReadyInMin": 12 if grid_available else 45,
                    },
                ],
            }
        },
        "energyLedger": {
            "deliveredKwhEq": 1240,
            "cleanFractionPct": 62 if grid_available else 88,
            "settlementPending": 120 if grid_available else 340,
        },
        "availableKwhEq": available_kwh_eq,
        "health": {
            "uptimePct": 99.4,
            "lastFault": None if grid_available else "GRID_OUTAGE",
            "firmwareVer": "fw-li-2.4.1",
        },
        "updatedAt": _iso_now(),
    }


def _hydrogen(
    node_id: str,
    cluster: str,
    operator_id: str,
    lat: float,
    lng: float,
    available_kwh_eq: float,
) -> dict[str, Any]:
    return {
        "schemaVersion": "gridpulse.telemetry.v1",
        "node": {
            "nodeId": node_id,
            "operatorId": operator_id,
            "assetClass": "HYDROGEN_HUB",
            "geo": {"lat": lat, "lng": lng, "cluster": cluster},
            "powerSource": {
                "currentSource": "GRID",
                "gridAvailable": True,
                "fallbackChain": ["GRID", "DIESEL_GENSET"],
            },
        },
        "metrics": {
            "hydrogen": {
                "canistersTotal": 16,
                "canistersFull": max(1, round(available_kwh_eq / 8)),
                "tankPressurePsi": 1180,
                "flowRateGramPerMin": 42,
                "purityPct": 99.2,
                "tankTempC": 28,
                "leakPpm": 4,
                "compressorDutyCyclePct": 38,
            }
        },
        "energyLedger": {
            "deliveredKwhEq": 890,
            "cleanFractionPct": 71,
            "settlementPending": 85,
        },
        "availableKwhEq": available_kwh_eq,
        "health": {"uptimePct": 99.7, "lastFault": None, "firmwareVer": "fw-h2-1.8.0"},
        "updatedAt": _iso_now(),
    }


NODES_SEED: list[dict[str, Any]] = [
    _lithium("GP-LAG-IKJ-014", "Ikeja", "OP-FRANCHISE-021", 6.6018, 3.3515, True, 48),
    _hydrogen("GP-LAG-IKJ-022", "Ikeja", "OP-FRANCHISE-021", 6.5962, 3.3428, 96),
    _lithium("GP-LAG-YAB-003", "Yaba", "OP-FRANCHISE-008", 6.5244, 3.3792, False, 14),
    _lithium("GP-LAG-YAB-011", "Yaba", "OP-FRANCHISE-008", 6.5189, 3.3712, False, 11),
    _hydrogen("GP-LAG-LEK-007", "Lekki", "OP-FRANCHISE-033", 6.4292, 3.5744, 112),
    _lithium("GP-LAG-LEK-019", "Lekki", "OP-FRANCHISE-033", 6.4355, 3.5612, True, 52),
    _hydrogen("GP-LAG-SUR-005", "Surulere", "OP-FRANCHISE-012", 6.4969, 3.3648, 64),
    _lithium("GP-LAG-SUR-016", "Surulere", "OP-FRANCHISE-012", 6.5012, 3.3521, True, 38),
    _lithium("GP-LAG-APA-002", "Apapa", "OP-FRANCHISE-004", 6.4487, 3.3599, True, 44),
    _hydrogen("GP-LAG-APA-009", "Apapa", "OP-FRANCHISE-004", 6.4412, 3.3688, 58),
    _lithium("GP-LAG-IKO-001", "Ikorodu", "OP-FRANCHISE-002", 6.5833, 3.5069, True, 36),
    _hydrogen("GP-LAG-IKO-018", "Ikorodu", "OP-FRANCHISE-002", 6.5712, 3.5211, 72),
]

CLUSTERS = ["Ikeja", "Yaba", "Lekki", "Surulere", "Apapa", "Ikorodu"]

GRAPH_PHASES = ["ASSESS", "FORECAST", "ALLOCATE", "REROUTE", "SETTLE", "DONE"]
