# GridPulse API — Endpoint Map

Base URL: `http://localhost:5000` (or `NEXT_PUBLIC_API_URL`)

## System

| Method | Path | Frontend consumer | Response shape |
|--------|------|-------------------|----------------|
| GET | `/health` | DevOps / load balancer | `{ status, service, version, telemetry_stations, agent_cycles_run, timestamp }` |
| WS | `/api/ws/live` | Live dashboard (future) | JSON events: `terminal_log`, `agent_action`, `ledger_entry`, `telemetry` |

## Dashboard (matches `frontend/lib/mockData.ts`)

| Method | Path | Frontend file | Notes |
|--------|------|---------------|-------|
| GET | `/api/metrics/kpi` | `components/kpi/KPISection.tsx` | Same fields as `generateKPIData()` |
| GET | `/api/energy/forecast` | `components/charts/EnergyForecastChart.tsx` | `{ data: [{ month, demand, actual }] }` |
| GET | `/api/distribution` | `components/charts/DistributionChart.tsx` | `{ data: [{ name, value, fill }] }` |
| GET | `/api/infrastructure/stations` | `components/infrastructure/InfrastructureMap.tsx` | `{ stations: [...] }` |
| GET | `/api/infrastructure/details` | `app/infrastructure/page.tsx` | `{ stations, assets }` |
| GET | `/api/logs/terminal` | `components/infrastructure/AIAgentTerminal.tsx` | `{ logs: [{ id, timestamp, message, type }] }` — **live agent feed** |
| GET | `/api/settlements` | `components/ledger/SettlementLedger.tsx` | `{ settlements: [...] }` |
| GET | `/api/performers/top` | `components/monitoring/TopPerformers.tsx` | `{ performers: [{ rank, provider, score, uptime, requests }] }` |
| GET | `/api/monitoring/metrics` | `components/monitoring/MonitoringMetrics.tsx` | `{ metrics: [...] }` + flat fields for api.example.ts |
| GET | `/api/transactions` | `app/transactions/page.tsx` | `{ transactions: [...] }` |
| GET | `/api/partners` | `app/partners/page.tsx` | `{ partners: [...] }` |
| GET | `/api/scheduler/events` | `app/scheduler/page.tsx` | `{ events: [...] }` |
| GET | `/api/analytics` | `app/analytics/page.tsx` | `{ revenue, gridPerformance, loadDistribution, partnerMetrics }` |
| GET | `/api/settings` | `app/settings/page.tsx` | `{ general, notifications, security, integrations }` |
| GET | `/api/help/faqs` | `app/help/page.tsx` | `{ faqs: [...] }` |

## Agent + IoT (hackathon core)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/telemetry/stations` | Polymorphic live payloads (Lithium_Swap / H2_Canister) |
| POST | `/api/telemetry/ingest` | AWS IoT Core / simulator ingest |
| POST | `/api/telemetry/simulate` | One-shot telemetry refresh (+ optional auto-agent) |
| POST | `/api/agent/cycle` | Run LangGraph balancer; body: `{ "force_scenario": "grid_outage_yaba" \| "normal" }` |
| GET | `/api/agent/activity` | Recent agent actions + terminal logs |
| GET | `/api/ledger/onchain` | Cross-operator settlement ledger (MVP blockchain trail) |

## Polymorphic telemetry payload

**Lithium swap (PS 6):**
```json
{
  "station_id": "ST-01",
  "type": "Lithium_Swap",
  "location": "Yaba",
  "grid_active": false,
  "solar_soc_pct": 42,
  "available_batteries": 2
}
```

**Hydrogen hub (PS 9):**
```json
{
  "station_id": "ST-02",
  "type": "H2_Canister",
  "location": "Lekki",
  "grid_active": true,
  "hydrogen_psi": 1200,
  "available_canisters": 8
}
```

## LangGraph agent cycle (demo)

1. **Evaluate** — detect grid outage + low lithium inventory at ST-01 (Yaba)
2. **Resolve** — find H2 surplus at ST-02 (Lekki)
3. **Execute** — reroute dual-power fleet, append terminal logs + on-chain ledger + settlement row

Trigger manually:
```bash
curl -X POST http://localhost:5000/api/agent/cycle \
  -H "Content-Type: application/json" \
  -d '{"force_scenario":"grid_outage_yaba"}'
```

## Frontend wiring checklist (for frontend dev)

1. `frontend/.env.local` → `NEXT_PUBLIC_API_URL=http://localhost:5000`
2. Copy `api.example.ts` → `api.ts`; extend with routes above not in template
3. Replace `mockData` imports per component
4. Poll `/api/logs/terminal` every 3–5s for live agent terminal (or use WebSocket)

## api.example.ts gaps

The template covers 8 endpoints. Additional backend routes for other pages:

- `/api/infrastructure/details`
- `/api/transactions`
- `/api/partners`
- `/api/scheduler/events`
- `/api/analytics`
- `/api/settings`
- `/api/help/faqs`
- `/api/telemetry/stations`
- `/api/ledger/onchain`
