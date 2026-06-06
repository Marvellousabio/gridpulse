from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Literal

from pydantic import BaseModel, Field


LogType = Literal["success", "warning", "info", "error"]
StationStatus = Literal["active", "maintenance", "inactive"]
SettlementStatus = Literal["completed", "pending", "processing"]
StationType = Literal["Lithium_Swap", "H2_Canister"]


class KPIResponse(BaseModel):
    totalRevenue: float
    revenueGrowth: float
    previousRevenue: float
    activeStations: int
    stationGrowth: float
    previousStations: int
    apiRequests: int
    requestGrowth: float
    previousRequests: int
    systemUptime: float
    uptimeGrowth: float
    previousUptime: float


class EnergyForecastPoint(BaseModel):
    month: str
    demand: float
    actual: float


class DistributionPoint(BaseModel):
    name: str
    value: float
    fill: str


class MapStation(BaseModel):
    id: int
    name: str
    lat: float
    lng: float
    status: StationStatus
    load: float
    station_type: StationType | None = None


class TerminalLog(BaseModel):
    id: int
    timestamp: str
    message: str
    type: LogType


class SettlementEntry(BaseModel):
    id: str
    date: str
    amount: float
    status: SettlementStatus
    provider: str
    reference: str


class TopPerformer(BaseModel):
    rank: int
    provider: str
    score: float
    uptime: str
    requests: str


class MonitoringMetric(BaseModel):
    id: int
    metric: str
    value: float
    unit: str
    status: Literal["normal", "warning", "critical"]
    threshold: str


class TelemetryPayload(BaseModel):
    station_id: str
    name: str
    type: StationType
    location: str
    lat: float
    lng: float
    grid_active: bool
    solar_soc_pct: float | None = None
    available_batteries: int | None = None
    hydrogen_psi: float | None = None
    available_canisters: int | None = None
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class AgentAction(BaseModel):
    id: str
    timestamp: str
    action_type: str
    source_station: str
    target_station: str | None = None
    vehicles_rerouted: int = 0
    kwh_equivalent: float = 0.0
    message: str


class OnChainLedgerEntry(BaseModel):
    id: str
    tx_hash: str
    timestamp: str
    operator_from: str
    operator_to: str
    kwh_equivalent: float
    amount_ngn: float
    status: Literal["confirmed", "pending"]
    description: str


class AgentCycleRequest(BaseModel):
    force_scenario: Literal["grid_outage_yaba", "normal"] | None = None


class AgentCycleResponse(BaseModel):
    cycle_id: str
    status: str
    alerts: list[str]
    actions: list[dict[str, Any]]
    terminal_logs: list[dict[str, Any]]
    ledger_entries: list[dict[str, Any]]


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    telemetry_stations: int
    agent_cycles_run: int
    timestamp: str


class AgentStateDict(BaseModel):
    """LangGraph workflow state snapshot."""

    telemetry: list[dict[str, Any]]
    alerts: list[str]
    actions: list[dict[str, Any]]
    terminal_messages: list[dict[str, Any]]
    ledger_entries: list[dict[str, Any]]
    cycle_id: str
