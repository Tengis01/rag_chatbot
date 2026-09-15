#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/../.."
exec docker compose --project-name rag-prod --env-file apps/api/.env -f compose.prod.yml "$@"
