#!/usr/bin/env bash
set -euo pipefail
umask 077
cd "$(dirname "${BASH_SOURCE[0]}")/../.."
mkdir -p backups
exec 9>backups/.backup.lock
if ! flock -n 9; then
  echo 'Another RAG backup is already running; no second dump was started.' >&2
  exit 75
fi
backup="backups/rag-$(date -u +%Y%m%dT%H%M%S)-$$.dump"
trap 'rm -f "$backup.partial"' EXIT
scripts/deploy/compose.sh exec -T postgres pg_dump -U rag -d rag_chatbot -Fc > "$backup.partial"
test -s "$backup.partial"
scripts/deploy/compose.sh exec -T postgres pg_restore --list < "$backup.partial" > /dev/null
mv "$backup.partial" "$backup"
sha256sum "$backup" > "$backup.sha256"
printf '%s\n' "$backup"
