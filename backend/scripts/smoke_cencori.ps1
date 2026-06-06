# Cencori smoke tests — requires CENCORI_API_KEY in backend/.env
param(
    [string]$Base = "http://127.0.0.1:5000"
)

Write-Host "=== Cencori status ===" -ForegroundColor Cyan
try {
    Invoke-RestMethod "$Base/api/ai/status" | ConvertTo-Json
} catch {
    Write-Host "Backend not reachable at $Base" -ForegroundColor Red
    exit 1
}

Write-Host "`n=== Non-streaming native smoke (SDK path via API) ===" -ForegroundColor Cyan
try {
    $smoke = Invoke-RestMethod -Method Post -Uri "$Base/api/ai/smoke"
    $smoke | ConvertTo-Json -Depth 4
} catch {
    Write-Host $_.Exception.Message -ForegroundColor Yellow
    Write-Host "Set CENCORI_API_KEY in backend/.env and restart uvicorn." -ForegroundColor Yellow
}

Write-Host "`n=== Non-streaming OpenAI-compatible chat ===" -ForegroundColor Cyan
$chatBody = @{
    messages = @(@{ role = "user"; content = "Reply with exactly: GridPulse curl OK" })
    stream   = $false
    max_tokens = 32
} | ConvertTo-Json -Depth 4

try {
    $chat = Invoke-RestMethod -Method Post -Uri "$Base/api/ai/chat" -ContentType "application/json" -Body $chatBody
    $content = $chat.choices[0].message.content
    Write-Host "Response: $content" -ForegroundColor Green
} catch {
    Write-Host $_.Exception.Message -ForegroundColor Yellow
}

Write-Host "`n=== Streaming curl example ===" -ForegroundColor Cyan
Write-Host @"
curl -N "$Base/api/ai/reason/stream" ^
  -H "Content-Type: application/json" ^
  -d `"{`"clusterId`":`"Ikeja`",`"prompt`":`"Grid failure`"}"
"@

Write-Host "`nDone." -ForegroundColor Green
