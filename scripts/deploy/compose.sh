#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/../.."

if [[ -n "${APP_REVISION_OVERRIDE:-}" ]]; then
  if [[ ! "$APP_REVISION_OVERRIDE" =~ ^[A-Za-z0-9][A-Za-z0-9_.-]*$ ]]; then
    printf 'APP_REVISION_OVERRIDE must be a Docker-tag-safe release identifier.\n' >&2
    exit 2
  fi

  override_env="$(mktemp)"
  trap 'rm -f "$override_env"' EXIT
  chmod 600 "$override_env"
  printf 'APP_REVISION=%s\n' "$APP_REVISION_OVERRIDE" > "$override_env"
  docker compose --project-name rag-prod --env-file apps/api/.env --env-file "$override_env" -f compose.prod.yml "$@"
  exit $?
fi

exec docker compose --project-name rag-prod --env-file apps/api/.env -f compose.prod.yml "$@"
