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

docker pull "$api_image"
docker pull "$web_image"

for image in "$api_image" "$web_image"; do
  revision="$(docker image inspect "$image" --format '{{ index .Config.Labels "org.opencontainers.image.revision" }}')"
  if [[ "$revision" != "$release_tag" ]]; then
    printf 'Image revision mismatch for %s: expected %s, got %s\n' "$image" "$release_tag" "${revision:-<missing>}" >&2
    exit 1
  fi
done

printf 'Pulled and verified:\n%s\n%s\n' "$api_image" "$web_image"
printf 'Ready for a separately reviewed drained deployment using APP_REVISION_OVERRIDE=%s.\n' "$release_tag"
