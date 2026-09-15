#!/usr/bin/env bash
# Run on Jarvis before replacing API. On timeout maintenance stays enabled;
# inspect active work, then retry or explicitly remove state/drain to reopen.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/../.."
mkdir -p state
touch state/drain
for ((attempt=0; attempt<120; attempt++)); do
  if scripts/deploy/compose.sh exec -T api node -e '
    fetch("http://127.0.0.1:4000/health").then(async r => {
      const h = await r.json();
      process.exit(r.ok && h.draining === true && h.activeIngestion === 0 && h.activeChats === 0 ? 0 : 1);
    }).catch(() => process.exit(1));
  '; then
    echo 'Drained: safe to back up and replace the single API.'
    exit 0
  fi
  sleep 5
done
echo 'Drain timed out; deployment deferred. Existing work is still running.' >&2
exit 1
