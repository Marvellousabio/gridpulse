# Frontend developer handoff

## Do you need the Cencori key?

**No.** Cencori runs on the **Render backend only**. Never put `CENCORI_API_KEY` in the frontend or in `NEXT_PUBLIC_*` env vars.

Give your FE dev **one URL**:

```env
# frontend/.env.local
NEXT_PUBLIC_API_BASE=https://your-gridpulse-api.onrender.com
```

That’s it. Mock mode works without any env (local demo UI only).

---

## What the backend handles (Render)

| Secret | Where | Purpose |
|--------|--------|---------|
| `CENCORI_API_KEY` | Render env | AI rebalance reasoning (FORECAST → SETTLE trace) |
| `CENCORI_MODEL` | Render env | e.g. `claude-sonnet-4.5` |
| `AI_REASONING` | Render env | `true` |

Optional Next.js server routes (`/api/agent/*`) only need Cencori if you run **Next locally** and hit those routes directly. For hackathon demo, **point UI at Render** and skip frontend Cencori entirely.

---

## Local dev

```powershell
cd frontend
pnpm install
pnpm dev
```

With Render backend:

```env
NEXT_PUBLIC_API_BASE=https://your-gridpulse-api.onrender.com
```

Verify connection:

```powershell
curl https://your-gridpulse-api.onrender.com/v1/health
```

Expect: `"cencoriEnabled": true`, `"ok": true`.

---

## Demo flow (live)

1. **Command Deck** — clusters + nodes from `/v1/clusters/availability`
2. **Orchestration** — **Simulate Grid Failure** → Cencori-powered reasoning trace
3. **Settlement** — elizaOS-style M2M agents, proof gate, `txHash` on CLEARED
4. **Carbon** — clean-energy ledger with `proofRef`

---

## Routes

| Page | API |
|------|-----|
| `/` | `/v1/clusters/availability`, `/v1/nodes` |
| `/orchestration` | `POST /v1/orchestrate/rebalance`, poll run |
| `/settlement` | `/v1/settlements`, `/v1/settlements/agents` |
| `/carbon` | `/v1/ledger/clean-energy` |

Sidebar shows **LIVE API** when `NEXT_PUBLIC_API_BASE` is set.
