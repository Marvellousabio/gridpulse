# ⚡ GridPulse API

### The Autonomous Multi-Source EV Energy Orchestrator

> **One control plane for distributed energy.** GridPulse abstracts Li-Ion battery-swap
> cabinets *and* off-grid hydrogen canister hubs into a single, chemistry-agnostic,
> self-healing network on AWS — and uses autonomous agents to reroute EV fleets across
> operators and across chemistries when the grid fails, with no human in the loop.

`Arthurite × AWS — "One with AI" Hackathon` · Targets **PS-1 · PS-6 · PS-9**

---

## The one-line thesis

> GridPulse turns energy from **an asset each operator owns and hoards** into **a service
> the network routes** — across incompatible chemistries, across competing operators,
> autonomously, with cryptographic settlement that makes sharing safe.

If Kubernetes orchestrates compute it doesn't own, GridPulse orchestrates **energy** it
doesn't own.

---

## The problem (the Lagos reality)

Nigeria's 2023 fuel-subsidy removal forced the shift to electric two- and three-wheelers,
but the constraint just moved one layer down: **the vehicles are ready, the energy under
them is not.** The grid is intermittent; operators bolt on solar PV and diesel gensets
independently; battery-swap cabinets and nascent hydrogen hubs run as isolated islands
with no shared visibility, no demand forecasting, and no way to settle energy between
competitors. The result: **empty stations next to full ones, fleets stranded by grid
outages, and capital locked in assets that can't be shared.**

GridPulse is built as the single control plane the three hackathon problem statements
collectively describe:

| | Problem | GridPulse answer |
|---|---|---|
| **PS-1** | No national charging-intelligence layer | Unified aggregation + visibility across every operator and chemistry |
| **PS-6** | Battery-swap demand imbalance | Predictive per-cluster forecasting + pre-positioning before stock-out |
| **PS-9** | Grid unreliability / multi-source | Autonomous source-shift (grid→solar→H₂) + cross-chemistry fleet reroute |

---

## How it works

```
 EDGE ASSETS            AWS INGEST + STATE        AGENTIC ORCHESTRATION        SETTLE + CONSUME
 ┌───────────────┐      ┌────────────────┐       ┌───────────────────┐       ┌────────────────────┐
 │ Li-Ion Swap   │─────▶│ AWS IoT Core   │       │ LangGraph+Cencori │       │ elizaOS Settlement │
 │ Cabinet (amber)│     │ (MQTT, certs)  │       │  ASSESS→FORECAST  │       │ Ledger (kWh/MJ)    │
 ├───────────────┤      └──────┬─────────┘       │  ALLOCATE→REROUTE │──────▶│ proof-gated, M2M   │
 │ H₂ Canister   │─────▶       ▼                 │  SETTLE→CHECKPOINT │       ├────────────────────┤
 │ Hub (cyan)    │      ┌────────────────┐  read │                   │       │ GridPulse REST API │
 ├───────────────┤      │ Lambda         │◀─────▶│  chemistry-blind  │       ├────────────────────┤
 │ Power Mux     │      │ Normalizer     │ intent│  human gate on    │       │ Fleets/Franchises/ │
 │ grid/solar/gen│      └──────┬─────────┘       │  threshold        │       │ Investors          │
 └───────────────┘             ▼                 └───────────────────┘       ├────────────────────┤
        ▲                ┌────────────────┐               │                  │ Carbon/Green-Bond  │
        │                │ DynamoDB State │               │  settle          │ MRV attestation    │
        │                │ (polymorphic)  │               └─────────────────▶└────────────────────┘
        │                └──────┬─────────┘
        │                       ▼
        │                ┌────────────────┐
        └────────────────│ Step Functions │   autonomous reroute / rebalance (feedback)
          reroute cmds   └────────────────┘
```

> Full technical paper: **`GridPulse_API_SOW.html`** (Statement of Work & Technical Report).

### Four pillars
1. **Polymorphic energy abstraction** — a discriminated-union telemetry envelope reduces a Li-Ion cabinet (SOC/SOH/V/°C) and a hydrogen hub (PSI/flow/purity/leak) to one shared, **kWh-equivalent** state model.
2. **Agentic orchestration** — a stateful **LangGraph** graph, lifecycle-managed by **Cencori** and durably orchestrated through **AWS Step Functions**, that decides *and acts* on grid failure.
3. **Trustless settlement** — **elizaOS** machine-to-machine wallets clear cross-operator energy debt, **proof-gated** against signed IoT hardware telemetry, writing an immutable kWh/MJ clean-energy ledger.
4. **AWS backbone** — IoT Core · Lambda · DynamoDB · Step Functions · (Timestream · EventBridge · API Gateway · Bedrock).

---

## The distinction (why judges should care)

AWS publishes its **own** EV-charging reference architecture: IoT Core → Lambda →
DynamoDB → Step Functions, with an immutable cryptographic transaction ledger (QLDB).
**GridPulse adopts that spine verbatim, then adds the three layers the reference design
doesn't have:**

1. **Chemistry-agnostic abstraction** — Li-Ion swap and hydrogen hub modeled as the same kind of thing (interchangeable kWh-eq nodes).
2. **Autonomous agentic rebalancing** — a loop that reroutes across operators *and* chemistries without a human.
3. **Trustless cross-operator settlement** — proof-gated M2M clearing so *competitors* can safely share infrastructure.

It speaks AWS's architectural language, then extends it into territory the reference
design explicitly leaves open. That's the line between a demo and credible infrastructure.

---

## Tech stack

| Layer | Tech |
|---|---|
| Ingestion | AWS IoT Core (MQTT, device certs, IoT Rules) |
| Compute | AWS Lambda (normalizer + agent steps) |
| State | Amazon DynamoDB (single-table, polymorphic) |
| Orchestration | LangGraph + Cencori on AWS Step Functions |
| Settlement | elizaOS M2M wallets + immutable kWh/MJ ledger |
| API | API Gateway + REST surface (§ below) |
| Frontend | Next.js + React + TypeScript + Tailwind (Ops Console) |
| Simulator | Python telemetry generator (both chemistries + injectable grid failure) |

---

## Repo structure

**In this repository today:**

```
gridpulse/
├── frontend/                    # Ops Console — Next.js, mock-driven demo UI
│   ├── app/                     # Command Deck, Orchestration, Settlement, Carbon, Node Detail
│   ├── components/ops/          # Grid Control Plane UI
│   └── lib/gridpulse/           # /v1 API client + deterministic Ikeja demo mocks
├── backend/                     # Local MVP — FastAPI + LangGraph (cloud path stand-in)
│   ├── app/services/            # agent, telemetry, state, gateway (Cencori passthrough)
│   ├── app/routes/              # /api/* REST + demo trigger + WebSocket
│   └── scripts/                 # run_demo.ps1, telemetry_simulator.py
├── GridPulse_API_SOW.html       # Statement of Work & Technical Report
└── README.md
```

**Target AWS layout** (DevOps deployment — see SOW):

```
gridpulse/
├── infra/            # IaC: IoT Core, DynamoDB table + GSI, Lambda, Step Functions
├── services/
│   ├── ingest/       # normalization Lambda (chemistry → kWh-eq)
│   ├── orchestrator/ # LangGraph/Cencori rebalance graph
│   └── settlement/   # elizaOS proof-gated settlement + ledger
├── simulator/        # Python polymorphic telemetry simulator
└── api/              # API Gateway REST surface (/v1/*)
```

---

## Implementation status (local MVP)

| Component | Status |
|---|---|
| Ops Console (5 routes, Ikeja demo) | **Built** — runs fully on mocks, no backend required |
| Polymorphic telemetry + kWh-eq model | **Built** — backend simulator + frontend types |
| LangGraph agent + cross-chemistry reroute | **Built** — local FastAPI; 3-node graph (extends to 5-phase in SOW) |
| `/v1/*` API contract | **Frontend-ready** — mocks match SOW; backend currently exposes `/api/*` |
| AWS IoT → Lambda → DynamoDB → Step Functions | **Designed** — SOW + `infra/` roadmap; DevOps deploys |
| elizaOS proof-gated settlement | **Designed** — settlement UI + ledger schema; M2M wiring on roadmap |

The local stack proves the agent loop, polymorphic abstraction, and demo narrative end-to-end. The AWS spine in the diagram is the production target documented in the SOW.

---

## Getting started

> Windows / PowerShell friendly. The Ops Console runs fully on mocks with no backend.

### Prerequisites
- Node.js ≥ 18, pnpm, Python ≥ 3.11
- AWS account + AWS CLI (for the cloud deployment path)

### 1. Ops Console (no backend required)

```powershell
cd frontend
pnpm install
pnpm dev                 # http://localhost:3000 — mocks drive everything
```

To hit a live `/v1` API instead of mocks, set in `frontend/.env.local`:

```env
NEXT_PUBLIC_API_BASE=https://<your-api-host>
```

### 2. Backend API (optional — agent + telemetry loop)

```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 5000
```

Trigger the Yaba grid-outage demo:

```powershell
cd backend
.\scripts\run_demo.ps1
```

Run the telemetry simulator:

```powershell
cd backend
.venv\Scripts\python scripts\telemetry_simulator.py
```

See `backend/DEPLOY.md` and `backend/API_ENDPOINTS.md` for endpoint details.

### 3. Cloud backend (IaC)

```powershell
cd infra
npm run deploy        # DevOps — see GridPulse_API_SOW.html Phase 2+
```

---

## API surface

| Method & path | Purpose |
|---|---|
| `POST /v1/telemetry/ingest` | Cloud-side ingest hook behind the IoT Rule → Lambda path (idempotent on `messageId`) |
| `GET  /v1/nodes/{id}/state` | Latest normalized state for any node, any chemistry |
| `GET  /v1/clusters/{id}/availability` | Aggregated kWh-eq availability across a cluster (the PS-1 layer) |
| `POST /v1/orchestrate/rebalance` | Trigger / simulate a grid-failure rebalancing run → `runId` |
| `GET  /v1/fleets/{id}/routing-plan` | Active reroute plan (incl. cross-chemistry hops) |
| `POST /v1/settlements/intent` | Create a proof-gated cross-operator settlement intent |
| `GET  /v1/ledger/clean-energy` | Export immutable kWh/MJ clean-energy records (MRV feed) |
| `GET  /v1/health` | Service + agent liveness (last checkpoint timestamp) |

The Ops Console client (`frontend/lib/gridpulse/api.ts`) implements this contract. The local FastAPI backend exposes a broader `/api/*` surface for development; `/v1` alignment is the integration path for production.

### Data model (essentials)
- **Telemetry envelope** — shared identity/geo/powerSource/signature wrapper + a chemistry-specific `metrics` block selected by `assetClass` (`LITHIUM_SWAP` | `HYDROGEN_HUB`), normalized to **kWh-equivalent**.
- **DynamoDB single-table** — `NODE#<id>` (`META` / `STATE#latest` / `TELEMETRY#<ts>`), `OPERATOR#<id>`, `REBAL#<runId>`, `SETTLE#<id>`; one GSI on `cluster` powers availability.
- **Agent state boundary** — the LangGraph run writes *intents only* (reroutes, source-shifts, settlement intents); it never directly actuates hardware or moves funds. Every transition is checkpointed → replayable + auditable.

---

## The agentic loop

```
GRID_FAILURE → ASSESS → FORECAST → ALLOCATE → REROUTE → SETTLE → DONE
                                       │
                              (chemistry-blind: a stranded Li-Ion
                               fleet can be routed to an H₂ hub,
                               measured in shared kWh-eq)
                                       │
                          human gate fires only if reroute volume
                          or settlement value exceeds policy
```

State is checkpointed to DynamoDB at every transition, so a run survives a Lambda
timeout/cold start and the decision is fully replayable.

---

## Demo script (≈ 90s)

1. **Command Deck** — show both chemistries live across Lagos clusters under one kWh-eq number.
2. **Node Detail** — open a Li-Ion node, then a Hydrogen node: same chrome, different physics, one model.
3. **Orchestration Theater** — hit **Simulate Grid Failure (Ikeja)**. Watch the loop run ASSESS→…→SETTLE, a Li-Ion fleet reroute to an **H₂ hub** (cross-chemistry), and a green **"resolved autonomously"** stamp.
4. **Settlement** — the cross-operator debt clears only after **proof** is verified.
5. **Carbon** — export the immutable clean-energy attestation (the green-bond/MRV unlock).

```powershell
cd frontend && pnpm dev
# open http://localhost:3000 → Orchestration → Simulate Grid Failure (Ikeja)
```

---

## Success criteria

- 0 stranded fleets in simulation · detection→reroute **< 5s** · 2/2 chemistries unified ·
  100% proof-gated settlements · 1 end-to-end autonomous demo · 8 API endpoints live.

## Out of scope (roadmap)

- Physical hardware actuation · live DisCo/SCADA grid feed · consumer mobile app ·
  mainnet settlement with treasury controls · trained ML demand model · multi-region rollout.

---

## Docs

- **`GridPulse_API_SOW.html`** — full Statement of Work & Technical Report (architecture, schemas, phases, risk, references).
- **`backend/API_ENDPOINTS.md`** — local FastAPI route reference.
- **`backend/DEPLOY.md`** — backend deployment notes.
- **`frontend/README.md`** — Ops Console routes and env vars.

---

**Built by dd — GridPulse Labs.** Targets PS-1 · PS-6 · PS-9 for the Arthurite × AWS "One with AI" Hackathon.
