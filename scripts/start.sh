#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

if lsof -ti :3000 >/dev/null 2>&1; then
  lsof -ti :3000 | xargs kill -9 2>/dev/null || true
  sleep 1
fi

node -e "JSON.parse(require('fs').readFileSync('package.json','utf8'))"

export NEXT_TELEMETRY_DISABLED=1

if [[ ! -f .next/BUILD_ID ]]; then
  echo "First run: building app (may take several minutes on Desktop)..."
  ./node_modules/.bin/next build
fi

echo ""
echo "CaseReady running at http://localhost:3000"
echo "Press Ctrl+C to stop."
echo ""

exec ./node_modules/.bin/next start -H 0.0.0.0 -p 3000
