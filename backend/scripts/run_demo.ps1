# GridPulse stage demo - run before presenting
# Usage: .\scripts\run_demo.ps1 [-ApiUrl http://localhost:5000]

param(
    [string]$ApiUrl = $env:API_BASE_URL
)

if (-not $ApiUrl) { $ApiUrl = "http://localhost:5000" }
$ApiUrl = $ApiUrl.TrimEnd("/")

Write-Host "GridPulse demo -> $ApiUrl" -ForegroundColor Cyan

function Invoke-GridPulse {
    param([string]$Method, [string]$Path, [object]$Body = $null)
    $params = @{
        Uri = "$ApiUrl$Path"
        Method = $Method
        ContentType = "application/json"
        TimeoutSec = 30
    }
    if ($Body) { $params.Body = ($Body | ConvertTo-Json) }
    return Invoke-RestMethod @params
}

Write-Host "[1/4] Health check..."
$h = Invoke-GridPulse GET "/health"
Write-Host ("  OK - service=" + $h.service + " stations=" + $h.telemetry_stations)

Write-Host "[2/4] Trigger Yaba grid-outage scenario..."
$demo = Invoke-GridPulse POST "/api/demo/trigger"
Write-Host ("  " + $demo.message)
Write-Host ("  cycle_id=" + $demo.cycle_id)

Write-Host "[3/4] Agent terminal (latest log)..."
$logs = Invoke-GridPulse GET "/api/logs/terminal"
Write-Host ("  " + $logs.logs[0].message)

Write-Host "[4/4] On-chain ledger entries..."
$ledger = Invoke-GridPulse GET "/api/ledger/onchain"
Write-Host ("  entries=" + $ledger.entries.Count)
if ($ledger.entries.Count -gt 0) {
    Write-Host ("  latest tx=" + $ledger.entries[0].tx_hash)
}

Write-Host ""
Write-Host ("Demo ready. Set NEXT_PUBLIC_API_URL to " + $ApiUrl) -ForegroundColor Green
