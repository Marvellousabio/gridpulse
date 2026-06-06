#!/usr/bin/env bash
# GridPulse stage demo — run before presenting
# Usage: ./scripts/run_demo.sh [API_BASE_URL]

set -euo pipefail
API_URL="${1:-${API_BASE_URL:-http://localhost:5000}}"
API_URL="${API_URL%/}"

echo "GridPulse demo -> $API_URL"

echo "[1/4] Health check..."
curl -sf "$API_URL/health" | head -c 200
echo ""

echo "[2/4] Trigger Yaba grid-outage scenario..."
curl -sf -X POST "$API_URL/api/demo/trigger" -H "Content-Type: application/json"
echo ""

echo "[3/4] Latest agent log..."
curl -sf "$API_URL/api/logs/terminal" | python -c "import sys,json; print(json.load(sys.stdin)['logs'][0]['message'])"

echo "[4/4] On-chain ledger..."
curl -sf "$API_URL/api/ledger/onchain" | python -c "import sys,json; d=json.load(sys.stdin); print('entries=', len(d['entries']))"

echo ""
echo "Demo ready. Set NEXT_PUBLIC_API_URL=$API_URL on the frontend."
