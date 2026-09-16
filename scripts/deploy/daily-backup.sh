#!/usr/bin/env bash
# Create one verified database dump, then retain the last N calendar days.
set -euo pipefail
umask 077
cd "$(dirname "${BASH_SOURCE[0]}")/../.."

retention_days="${RAG_BACKUP_RETENTION_DAYS:-7}"
[[ "$retention_days" =~ ^[1-9][0-9]*$ ]] || {
  echo 'RAG_BACKUP_RETENTION_DAYS must be a positive integer' >&2
  exit 2
}

mkdir -p backups
exec 9>backups/.daily-backup.lock
if ! flock -n 9; then
  echo 'Daily RAG backup is already running; skipped duplicate schedule.' >&2
  exit 75
fi

scripts/deploy/backup.sh

# Retain today and the preceding retention_days - 1 calendar days. A pair is
# removed only when its checksum exists and still validates.
cutoff_days=$((retention_days - 1))
while IFS= read -r -d '' dump; do
  [[ "$dump" =~ ^backups/rag-[0-9]{8}T[0-9]{6}-[0-9]+\.dump$ ]] || continue
  checksum="${dump}.sha256"
  if [[ ! -f "$checksum" ]]; then
    echo "Retention skipped $dump: checksum is missing" >&2
    continue
  fi
  if ! sha256sum -c "$checksum" >/dev/null; then
    echo "Retention skipped $dump: checksum does not validate" >&2
    continue
  fi
  rm -- "$checksum" "$dump"
  echo "Retention removed $dump"
done < <(find backups -maxdepth 1 -type f -name 'rag-*.dump' -daystart -mtime +"$cutoff_days" -print0)
