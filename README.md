# GridPulse

B2B energy middleware + Ops Console for the Arthurite × AWS hackathon.

## Structure

```
gridpulse/
├── frontend/     ← Ops Console (Next.js) — primary demo UI
├── backend/      ← FastAPI + LangGraph API
└── README.md
```

## Run locally

**Frontend (mock mode):**
```powershell
cd frontend
pnpm install
pnpm dev
```

**Backend (optional):**
```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 5000
```

## Demo trigger (backend)

```powershell
cd backend
.\scripts\run_demo.ps1
```
