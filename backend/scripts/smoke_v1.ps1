# Quick /v1 API smoke test (backend must be running)
param(
    [string]$Base = "http://127.0.0.1:5000"
)

Write-Host "Health..." -ForegroundColor Cyan
$health = Invoke-RestMethod "$Base/v1/health"
$health | ConvertTo-Json

Write-Host "`nTrigger Ikeja rebalance..." -ForegroundColor Cyan
$run = Invoke-RestMethod -Method Post -Uri "$Base/v1/orchestrate/rebalance" -ContentType "application/json" -Body '{"clusterId":"Ikeja"}'
$runId = $run.runId
Write-Host "runId: $runId"

for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Milliseconds 300
    $state = Invoke-RestMethod "$Base/v1/orchestrate/rebalance/$runId"
    Write-Host "  phase: $($state.graphPhase) trace: $($state.audit.reasoningTrace.Count)"
    if ($state.graphPhase -eq "DONE" -and $state.audit.reasoningTrace.Count -ge 5) { break }
}

Write-Host "`nAgent: $($state.audit.agent)" -ForegroundColor Green
Write-Host "Model: $($state.forecast.model)" -ForegroundColor Green
Write-Host "Done." -ForegroundColor Green
