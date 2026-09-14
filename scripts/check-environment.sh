#!/usr/bin/env bash
# Read-only inventory. Does not print environment values or contact Gemini.
set -uo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."
export PATH="$HOME/.local/bin:$PATH"
missing=0
for tool in node npm pnpm docker xelatex latexmk biber pdftoppm fc-match go adb; do
  if location=$(command -v "$tool"); then
    printf 'OK       %-12s %s\n' "$tool" "$location"
  else
    printf 'MISSING  %s\n' "$tool"
    missing=1
  fi
done

if command -v node >/dev/null && command -v pnpm >/dev/null; then
  expected=$(node -p 'require("./package.json").packageManager')
  actual=$(pnpm --version) || exit 1
  printf 'pnpm: expected %s; installed %s\n' "$expected" "$actual"
  [[ "$expected" == "pnpm@$actual" ]] || missing=1
fi
if [[ ! -d node_modules ]]; then
  echo 'MISSING  workspace dependencies: run pnpm install --frozen-lockfile'
  missing=1
fi
if command -v docker >/dev/null; then
  docker compose version || missing=1
  if ! docker info --format 'Docker server: {{.ServerVersion}}'; then
    echo 'BLOCKED  Docker daemon unavailable or current user lacks socket access.'
    missing=1
  fi
fi
if command -v fc-match >/dev/null; then
  printf 'Times New Roman resolves to: '
  fc-match 'Times New Roman' --format '%{family}\n'
fi
if command -v python3 >/dev/null; then
  python3 - <<'PY' || missing=1
from pathlib import Path
import re

path = Path('apps/api/.env')
values = {}
if path.exists():
    for line in path.read_text().splitlines():
        match = re.match(r'^\s*(?:export\s+)?([A-Z][A-Z0-9_]*)\s*=\s*(.*)$', line)
        if match:
            values[match[1]] = match[2].strip().strip('\"\x27')
absent = [key for key in ('DATABASE_URL', 'GEMINI_API_KEY', 'BETTER_AUTH_SECRET')
          if not values.get(key)]
for key in absent:
    print(f'MISSING  {key} in apps/api/.env (host development)')
if not absent:
    print('OK       API environment keys present; values not validated or displayed.')
raise SystemExit(bool(absent))
PY
else
  echo 'MISSING  python3 (API environment check skipped)'
  missing=1
fi
exit "$missing"
