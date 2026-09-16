#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/../.."

release_state=state/release.env
if [[ -r "$release_state" ]]; then
  while IFS='=' read -r key value; do
    case "$key" in
      API_IMAGE)
        if [[ "$value" =~ ^ghcr\.io/tengis01/rag-api:sha-[0-9a-f]{40}$ && -z "${API_IMAGE:-}" ]]; then
          export API_IMAGE="$value"
        fi
        ;;
      WEB_IMAGE)
        if [[ "$value" =~ ^ghcr\.io/tengis01/rag-web:sha-[0-9a-f]{40}$ && -z "${WEB_IMAGE:-}" ]]; then
          export WEB_IMAGE="$value"
        fi
        ;;
      APP_REVISION_OVERRIDE)
        if [[ "$value" =~ ^sha-[0-9a-f]{40}$ && -z "${APP_REVISION_OVERRIDE:-}" ]]; then
          export APP_REVISION_OVERRIDE="$value"
        fi
        ;;
    esac
  done < "$release_state"
fi

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
