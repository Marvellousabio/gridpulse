# GridPulse API — Backend

B2B energy middleware layer for multi-operator commercial networks. Exposes REST + WebSocket APIs for the GridPulse Command Center frontend, ingests polymorphic IoT telemetry (Lithium swap + H2 canister hubs), and runs an autonomous **LangGraph GridPulse Balancer Agent** with optional **Cencori AI Gateway** routing.

## Quick start (local)

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
# source .venv/bin/activate

pip install -r requirements.txt
copy .env.example .env   # Windows — use cp on Unix

uvicorn app.main:app --reload --host 0.0.0.0 --port 5000
```

- API docs: http://localhost:5000/docs
- Health: http://localhost:5000/health

## Docker (DevOps handoff)

```bash
cd backend
docker compose up --build

# Optional: run external telemetry simulator alongside API
docker compose --profile demo up --build
```

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `HOST` | `0.0.0.0` | Bind host |
| `PORT` | `5000` | Bind port |
| `CORS_ORIGINS` | `http://localhost:3000,...` | Comma-separated frontend origins |
| `CENCORI_API_URL` | _(empty)_ | Cencori gateway URL; empty = local passthrough |
| `CENCORI_API_KEY` | _(empty)_ | Bearer token for Cencori |
| `TELEMETRY_INTERVAL_SECONDS` | `5` | Background IoT simulation interval |
| `AUTO_AGENT_CYCLES` | `true` | Auto-run LangGraph when critical telemetry detected |
| `API_BASE_URL` | `http://localhost:5000` | Target for standalone simulator script |

## Architecture

```
[ Mock IoT / telemetry_simulator.py ] ──► POST /api/telemetry/ingest
                                                      │
[ Background telemetry loop ] ────────────────────────┤
                                                      ▼
                                            [ In-memory AppState ]
                                                      │
                              [ Cencori Gateway (optional) ]
                                                      ▼
                                            [ LangGraph Balancer ]
                                                      │
                    ┌─────────────────────────────────┴──────────────────────────┐
                    ▼                                                            ▼
         POST /api/agent/cycle                                    WebSocket /api/ws/live
         GET /api/logs/terminal                                   GET /api/ledger/onchain
         GET /api/settlements
```

## Frontend integration

Set in `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Copy `frontend/lib/api.example.ts` → `frontend/lib/api.ts` and swap component imports from `mockData` to `apiClient`.

See **[API_ENDPOINTS.md](./API_ENDPOINTS.md)** for the full endpoint ↔ frontend mapping.

## Hackathon demo commands

```bash
# Force grid outage scenario + agent rebalancing
curl -X POST http://localhost:5000/api/agent/cycle \
  -H "Content-Type: application/json" \
  -d "{\"force_scenario\": \"grid_outage_yaba\"}"

# Watch live agent terminal logs
curl http://localhost:5000/api/logs/terminal

# On-chain settlement ledger
curl http://localhost:5000/api/ledger/onchain

# Run standalone IoT simulator (separate terminal)
python scripts/telemetry_simulator.py --scenario grid_outage_yaba --trigger-agent
```

## Project layout

```
backend/
├── app/
│   ├── main.py              # FastAPI app + background telemetry loop
│   ├── config.py            # Settings from env
│   ├── data/seed.py         # Seed data (matches frontend mockData.ts)
│   ├── models/schemas.py    # Pydantic models
│   ├── routes/              # REST + WebSocket routers
│   └── services/
│       ├── agent.py         # LangGraph balancer workflow
│       ├── gateway.py       # Cencori passthrough
│       ├── telemetry.py     # Polymorphic IoT generator
│       └── state.py         # In-memory live state
├── scripts/
│   └── telemetry_simulator.py
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
└── API_ENDPOINTS.md
```

## Notes for DevOps

- Stateless container; data is in-memory (resets on restart) — suitable for hackathon demo.
- Health check path: `GET /health`
- Recommended deploy: single container on port `5000`, fronted by ALB/API Gateway.
- For production hardening: add Redis/Postgres persistence, auth middleware, and AWS IoT Core rule → HTTP integration to `/api/telemetry/ingest`.
