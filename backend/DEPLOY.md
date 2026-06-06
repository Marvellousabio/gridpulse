# Production / staging deploy checklist (DevOps)

## 1. Build & run

```bash
cd backend
docker compose up --build -d
```

## 2. Required environment variables

```env
HOST=0.0.0.0
PORT=5000
CORS_ORIGINS=https://YOUR-FRONTEND.vercel.app,http://localhost:3000
AUTO_AGENT_CYCLES=true
TELEMETRY_INTERVAL_SECONDS=8
```

Optional Cencori:
```env
CENCORI_API_URL=https://your-gateway.cencori.com
CENCORI_API_KEY=...
```

## 3. Frontend env (Vercel)

```env
NEXT_PUBLIC_API_URL=https://YOUR-API-URL
```

Copy from `frontend/.env.local.example`.

## 4. Health check

- Path: `GET /health`
- Expect: `{ "status": "ok", ... }`

## 5. Stage demo (one command)

Windows:
```powershell
.\scripts\run_demo.ps1 -ApiUrl https://YOUR-API-URL
```

Linux/macOS:
```bash
./scripts/run_demo.sh https://YOUR-API-URL
```

Or:
```bash
curl -X POST https://YOUR-API-URL/api/demo/trigger
```

## 6. Common production pitfalls (avoided in this build)

| Risk | Mitigation |
|------|------------|
| CORS blocks frontend | Set `CORS_ORIGINS` to exact frontend URL (no trailing slash) |
| Agent double-fire | `_agent_lock` serializes cycles |
| Cencori outage crashes demo | Gateway falls back to local passthrough |
| Race on JSON responses | `app_state.snapshot()` copies under lock |
| Unhandled 500 HTML | Global JSON error handler |
| Telemetry simulator format | POST raw JSON array to `/api/telemetry/ingest` |

## 7. Optional demo profile

Runs API + continuous telemetry simulator:

```bash
docker compose --profile demo up --build
```
