#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 || ! "$1" =~ ^[0-9a-f]{40}$ ]]; then
  printf 'Usage: %s <40-character lowercase Git commit SHA>\n' "${0##*/}" >&2
  exit 2
fi

readonly release_sha="$1"
readonly release_tag="sha-$release_sha"
readonly api_image="ghcr.io/tengis01/rag-api:$release_tag"
readonly web_image="ghcr.io/tengis01/rag-web:$release_tag"
readonly repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$repo_root"

if [[ -e state/drain ]]; then
  printf 'Release blocked: existing maintenance requires operator review.\n' >&2
  exit 1
fi

export DOCKER_CONFIG="${DOCKER_CONFIG:-$HOME/.config/rag-chatbot/ghcr-docker}"
readonly lock_path="$repo_root/state/.release.lock"
mkdir -p "$repo_root/state"
exec 9>"$lock_path"
if ! flock -n 9; then
  printf 'Another RAG release is already running.\n' >&2
  exit 1
fi

available_kib="$(df --output=avail / | awk 'NR == 2 { print $1 }')"
if [[ -z "$available_kib" || "$available_kib" -lt 15728640 ]]; then
  printf 'Release blocked: root filesystem has less than 15 GiB available.\n' >&2
  exit 1
fi

readonly old_api_image="$(docker inspect rag-prod-api-1 --format '{{.Config.Image}}')"
readonly old_web_image="$(docker inspect rag-prod-web-1 --format '{{.Config.Image}}')"
readonly old_revision="$(docker image inspect "$old_api_image" --format '{{ index .Config.Labels "org.opencontainers.image.revision" }}')"
if [[ -z "$old_revision" ]]; then
  printf 'Release blocked: current API image has no revision label.\n' >&2
  exit 1
fi

docker pull "$api_image"
docker pull "$web_image"
for image in "$api_image" "$web_image"; do
  revision="$(docker image inspect "$image" --format '{{ index .Config.Labels "org.opencontainers.image.revision" }}')"
  if [[ "$revision" != "$release_tag" ]]; then
    printf 'Release blocked: image revision mismatch for %s.\n' "$image" >&2
    exit 1
  fi
done

scripts/deploy/drain.sh
scripts/deploy/backup.sh

rollback_previous() {
  touch state/drain
  printf 'Release failed; restoring previous API/Web images.\n' >&2
  if ! API_IMAGE="$old_api_image" \
  WEB_IMAGE="$old_web_image" \
  APP_REVISION_OVERRIDE="$old_revision" \
    scripts/deploy/compose.sh up -d --no-deps --wait api web; then
    printf 'Rollback failed; maintenance remains enabled.\n' >&2
    return 1
  fi
  local restored_health
  if ! restored_health="$(curl -fsS --max-time 20 -H 'Host: api.ragchatbot.dev' http://127.0.0.1:8080/health)" ||
    [[ "$restored_health" != *"\"revision\":\"$old_revision\""* ]]; then
    printf 'Rollback health failed; maintenance remains enabled.\n' >&2
    return 1
  fi
  rm -f state/drain
}

if ! API_IMAGE="$api_image" \
  WEB_IMAGE="$web_image" \
  APP_REVISION_OVERRIDE="$release_tag" \
  scripts/deploy/compose.sh up -d --no-deps --wait api web; then
  rollback_previous
  exit 1
fi

if ! candidate_health="$(curl -fsS --max-time 20 -H 'Host: api.ragchatbot.dev' http://127.0.0.1:8080/health)"; then
  rollback_previous
  exit 1
fi
if [[ "$candidate_health" != *"\"revision\":\"$release_tag\""* ]]; then
  printf 'Release failed: candidate health revision did not match %s.\n' "$release_tag" >&2
  rollback_previous
  exit 1
fi

rm -f state/drain
if ! final_health="$(curl -fsS --max-time 20 -H 'Host: api.ragchatbot.dev' http://127.0.0.1:8080/health)"; then
  rollback_previous
  exit 1
fi
if [[ "$final_health" != *"\"revision\":\"$release_tag\""* || "$final_health" != *'"draining":false'* ]]; then
  printf 'Release failed: final health check did not confirm revision and open admission.\n' >&2
  rollback_previous
  exit 1
fi

printf 'Released %s\n' "$release_tag"
