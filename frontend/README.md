# GridPulse Ops Console

Autonomous multi-source EV energy orchestrator — **Arthurite × AWS** hackathon demo.

## Quick start (Windows)

```powershell
cd frontend
pnpm install
pnpm dev
```

Open http://localhost:3000 — works fully offline in **mock mode**.

## Live API

```env
NEXT_PUBLIC_API_BASE=https://your-api-host
```

Requires `/v1/*` endpoints (see `lib/gridpulse/api.ts`).

## Demo path (90 seconds)

1. **Command Deck** (`/`) — Lagos cluster map, amber Li-Ion + cyan H₂ nodes
2. **Orchestration** (`/orchestration`) — **Simulate Grid Failure** (Ikeja)
3. Watch agent phases → cross-chemistry reroute badge
4. **Settlement** + **Carbon** — proof-gated ledger + MRV export

## Routes

| Path | Screen |
|------|--------|
| `/` | Command Deck |
| `/nodes/[nodeId]` | Polymorphic node detail |
| `/orchestration` | Agent loop showpiece |
| `/settlement` | Proof-gated ledger |
| `/carbon` | Clean-energy MRV |

## Stack

Next.js 16 · React 19 · Tailwind v4 · Recharts · Framer Motion · mock `GridPulseApi`

## Backend

Optional FastAPI backend in `../backend/` — set `NEXT_PUBLIC_API_BASE` when `/v1` routes are deployed.
