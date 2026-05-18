#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

# Free port 3000
if lsof -ti :3000 >/dev/null 2>&1; then
  lsof -ti :3000 | xargs kill -9 2>/dev/null || true
  sleep 1
fi

# Validate package.json (iCloud sometimes corrupts it)
node -e "JSON.parse(require('fs').readFileSync('package.json','utf8'))"

export NEXT_TELEMETRY_DISABLED=1
# Desktop / cloud-synced folders: use polling so file watcher does not hang
export WATCHPACK_POLLING=true
export CHOKIDAR_USEPOLLING=true

echo ""
echo "Starting CaseReady at http://localhost:3000"
echo "Press Ctrl+C to stop."
echo ""

exec ./node_modules/.bin/next dev -H 0.0.0.0 -p 3000
