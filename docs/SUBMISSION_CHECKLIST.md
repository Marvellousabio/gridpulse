# GridPulse — Submission Checklist

Use this before demo day. Mark items as you complete them.

---

## Tier 1 — Must have (judges will notice)

| # | Item | Status | Notes |
|---|------|--------|-------|
| 1 | **Live backend `/v1/*` API** | 🟡 Built | Set `NEXT_PUBLIC_API_BASE=http://localhost:5000` in `frontend/.env.local` |
| 2 | **Claude API reasoning** | 🟡 Built | Set `ANTHROPIC_API_KEY` in `backend/.env` — powers FORECAST + ALLOCATE + audit trace |
| 3 | **Orchestration demo on live API** | ⬜ Test | Command Deck → Orchestration → Simulate Grid Failure with backend running |
| 4 | **Public deploy (Render/Railway/Fly)** | ⬜ You | Backend URL judges can hit — DevOps or `render.yaml` |
| 5 | **Demo script rehearsed (90s)** | ⬜ You | Problem → Command Deck → Orchestration → Settlement → Carbon |
| 6 | **Honest pitch language** | ⬜ You | Say "agentic policy + Claude reasoning" not "fully deployed AWS" |

---

## Tier 2 — Strong differentiators

| # | Item | Status | Notes |
|---|------|--------|-------|
| 7 | Cross-chemistry reroute (Li → H₂) | ✅ | Core product insight — show on Orchestration page |
| 8 | kWh-eq polymorphic model | ✅ | Same UI for Li-ion packs and H₂ canisters |
| 9 | Proof-gated settlement flow | 🟡 | SHA256 proof from telemetry hash; UI shows PENDING → VERIFIED → CLEARED |
| 10 | PS-1 / PS-6 / PS-9 mapping in README | ✅ | Root README + SOW |
| 11 | LangGraph agent loop (backend) | ✅ | 3-node graph + optional Claude enrichment |
| 12 | SOW document in repo | ✅ | `GridPulse_API_SOW.html` |

---

## Tier 3 — AWS / production story (SOW + slides)

| # | Item | Status | Notes |
|---|------|--------|-------|
| 13 | IoT Core → Lambda ingest diagram | 📄 SOW | Reference in pitch, not required live |
| 14 | DynamoDB single-table schema | 📄 SOW | Checkpoint IDs in audit trace |
| 15 | Step Functions orchestration | 📄 SOW | LangGraph maps to state machine |
| 16 | elizaOS M2M settlement | 📄 Roadmap | Proof ref + ledger export ready for wiring |
| 17 | Cencori gateway hook | ✅ | `CENCORI_API_URL` optional passthrough |
| 18 | Excalidraw architecture board | ⬜ You | Attach to repo or slide deck |

---

## Tier 4 — Polish

| # | Item | Status | Notes |
|---|------|--------|-------|
| 19 | `AUTO_AGENT_CYCLES=false` during staged demo | ⬜ | Avoid background agent fighting your scripted trigger |
| 20 | Seed settlements + carbon records on backend | 🟡 | `/v1/settlements`, `/v1/ledger/clean-energy` |
| 21 | Health endpoint shows Claude status | 🟡 | `/v1/health` → `claudeEnabled`, `lastCheckpoint` |
| 22 | Screen recording backup | ⬜ You | If live demo network fails |
| 23 | Remove stale root docs | ⬜ | `DELIVERY_SUMMARY.md`, `START_HERE.md` clutter |

---

## Environment setup

### Backend (`backend/.env`)

```env
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-sonnet-4-20250514
CLAUDE_REASONING=true
AUTO_AGENT_CYCLES=false
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_BASE=http://localhost:5000
```

### Run stack

```powershell
# Terminal 1
cd backend
.venv\Scripts\uvicorn app.main:app --reload --port 5000

# Terminal 2
cd frontend
pnpm dev
```

---

## What makes this stand out (pitch bullets)

1. **Problem** — Lagos grid failure strands EV fleets; operators can't share energy across chemistries or competitors.
2. **Insight** — Normalize Li swap + H₂ hub to kWh-eq; route dual-power fleets cross-chemistry when Li is stressed.
3. **AI** — Claude analyzes live cluster telemetry and produces forecast + reroute decision + auditable reasoning trace (not hard-coded strings when API key is set).
4. **Trust** — Settlement clears only after IoT telemetry proof hash is verified.
5. **Scale story** — Same control plane on AWS IoT → Lambda → DynamoDB → Step Functions (SOW).

---

## Pre-submission smoke test

```powershell
cd backend
.venv\Scripts\python -c "
import httpx, time
b='http://localhost:5000'
assert httpx.get(f'{b}/v1/health').json()['ok']
r=httpx.post(f'{b}/v1/orchestrate/rebalance', json={'clusterId':'Ikeja'}).json()
rid=r['runId']
for _ in range(30):
    s=httpx.get(f'{b}/v1/orchestrate/rebalance/{rid}').json()
    if s['graphPhase']=='DONE': break
    time.sleep(0.3)
print('phase', s['graphPhase'], 'trace lines', len(s['audit']['reasoningTrace']))
"
```

Expected: `phase DONE`, reasoning trace ≥ 3 lines (5 with Claude).
