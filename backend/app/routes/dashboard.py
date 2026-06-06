from __future__ import annotations

from fastapi import APIRouter

from app.services.state import app_state

router = APIRouter(prefix="/api", tags=["dashboard"])


@router.get("/metrics/kpi")
async def get_kpi_metrics():
    """Matches frontend mockData.generateKPIData()."""
    return app_state.kpi


@router.get("/energy/forecast")
async def get_energy_forecast():
    """Returns mockData-compatible array; also wraps for api.example.ts consumers."""
    return {"data": app_state.energy_forecast, "forecast": app_state.energy_forecast}


@router.get("/distribution")
async def get_distribution():
    return {"data": app_state.distribution, "distribution": app_state.distribution}


@router.get("/infrastructure/stations")
async def get_stations():
    return {"stations": app_state.map_stations}


@router.get("/infrastructure/details")
async def get_infrastructure_details():
    return app_state.infrastructure_details


@router.get("/logs/terminal")
async def get_terminal_logs():
    return {"logs": app_state.terminal_logs}


@router.get("/settlements")
async def get_settlements():
    return {"settlements": app_state.settlements}


@router.get("/performers/top")
async def get_top_performers():
    return {"performers": app_state.top_performers}


@router.get("/monitoring/metrics")
async def get_monitoring_metrics():
    """Returns array format used by MonitoringMetrics component."""
    flat = {
        "frequency": app_state.monitoring_metrics[0]["value"],
        "voltage": app_state.monitoring_metrics[1]["value"],
        "reactivepower": app_state.monitoring_metrics[2]["value"],
        "transmissionloss": app_state.monitoring_metrics[3]["value"],
        "demandresponse": app_state.monitoring_metrics[4]["value"],
        "metrics": app_state.monitoring_metrics,
    }
    return flat


@router.get("/transactions")
async def get_transactions():
    return {"transactions": app_state.transactions}


@router.get("/partners")
async def get_partners():
    return {"partners": app_state.partners}


@router.get("/scheduler/events")
async def get_scheduled_events():
    return {"events": app_state.scheduled_events}


@router.get("/analytics")
async def get_analytics():
    return app_state.analytics


@router.get("/settings")
async def get_settings():
    return app_state.settings


@router.get("/help/faqs")
async def get_faqs():
    return {"faqs": app_state.faqs}
