from __future__ import annotations

from fastapi import APIRouter

from app.services.state import app_state

router = APIRouter(prefix="/api", tags=["dashboard"])


@router.get("/metrics/kpi")
async def get_kpi_metrics():
    return await app_state.snapshot("kpi")


@router.get("/energy/forecast")
async def get_energy_forecast():
    forecast = await app_state.snapshot("energy_forecast")
    return {"data": forecast, "forecast": forecast}


@router.get("/distribution")
async def get_distribution():
    distribution = await app_state.snapshot("distribution")
    return {"data": distribution, "distribution": distribution}


@router.get("/infrastructure/stations")
async def get_stations():
    return {"stations": await app_state.snapshot("map_stations")}


TELEMETRY_TO_MAP_ID = {"ST-01": 1, "ST-02": 2, "ST-03": 4}


@router.get("/infrastructure/live")
async def get_live_infrastructure():
    """Map stations merged with live IoT telemetry for dashboard demo."""
    stations = await app_state.snapshot("map_stations")
    telemetry = await app_state.snapshot("telemetry")
    by_station_id = {t["station_id"]: t for t in telemetry}
    telemetry_by_map_id = {
        map_id: by_station_id[sid]
        for sid, map_id in TELEMETRY_TO_MAP_ID.items()
        if sid in by_station_id
    }
    enriched = []
    for station in stations:
        row = {**station}
        tel = telemetry_by_map_id.get(station["id"])
        if tel:
            row["telemetry"] = tel
            row["station_type"] = tel.get("type")
        enriched.append(row)
    return {"stations": enriched, "telemetry": telemetry}


@router.get("/infrastructure/details")
async def get_infrastructure_details():
    return await app_state.snapshot("infrastructure_details")


@router.get("/logs/terminal")
async def get_terminal_logs():
    return {"logs": await app_state.snapshot("terminal_logs")}


@router.get("/settlements")
async def get_settlements():
    return {"settlements": await app_state.snapshot("settlements")}


@router.get("/performers/top")
async def get_top_performers():
    return {"performers": await app_state.snapshot("top_performers")}


@router.get("/monitoring/metrics")
async def get_monitoring_metrics():
    metrics = await app_state.snapshot("monitoring_metrics")
    return {
        "frequency": metrics[0]["value"],
        "voltage": metrics[1]["value"],
        "reactivepower": metrics[2]["value"],
        "transmissionloss": metrics[3]["value"],
        "demandresponse": metrics[4]["value"],
        "metrics": metrics,
    }


@router.get("/transactions")
async def get_transactions():
    return {"transactions": await app_state.snapshot("transactions")}


@router.get("/partners")
async def get_partners():
    return {"partners": await app_state.snapshot("partners")}


@router.get("/scheduler/events")
async def get_scheduled_events():
    return {"events": await app_state.snapshot("scheduled_events")}


@router.get("/analytics")
async def get_analytics():
    return await app_state.snapshot("analytics")


@router.get("/settings")
async def get_settings():
    return await app_state.snapshot("settings")


@router.get("/help/faqs")
async def get_faqs():
    return {"faqs": await app_state.snapshot("faqs")}
