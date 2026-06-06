# Pre-demo checklist (2 min)

## Render backend env (required)

```env
CENCORI_API_KEY=csk_...
CENCORI_MODEL=claude-sonnet-4.5
AI_REASONING=true
AUTO_AGENT_CYCLES=false
CORS_ORIGINS=*
```

## Frontend `.env.local`

**Option A — live demo (recommended):**
```env
NEXT_PUBLIC_API_BASE=https://YOUR-SERVICE.onrender.com
```

**Option B — offline mock (no backend):**
Delete or comment out `NEXT_PUBLIC_API_BASE` and `NEXT_PUBLIC_API_URL`.

## Verify backend (replace URL)

```powershell
cd backend
.venv\Scripts\python scripts\demo_check.py https://YOUR-SERVICE.onrender.com
```

Must print `ALL CHECKS PASSED`.

## Run frontend

```powershell
cd frontend
pnpm dev
```

## 90s demo order

1. `/` Command Deck — clusters + chemistry split  
2. `/orchestration` — **Simulate Grid Failure (Ikeja)** → wait for green stamp  
3. `/settlement` — CLEARED row with `txHash`  
4. `/carbon` — export ledger  

## If something breaks

| Symptom | Fix |
|---------|-----|
| Orchestration red error | Set `NEXT_PUBLIC_API_BASE` to Render URL (not localhost) |
| Cencori badge missing | `CENCORI_API_KEY` on Render + redeploy |
| CORS error in browser | Set `CORS_ORIGINS=*` on Render |
| Blank Command Deck | Render service sleeping — hit `/v1/health` once, wait 30s |
