#!/usr/bin/env bash
# Install one user-level RAG backup entry without rewriting unrelated cron jobs.
set -euo pipefail
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cron_line="0 19 * * * ${repo_root}/scripts/deploy/daily-backup.sh >> ${repo_root}/backups/daily-backup.log 2>&1 # RAG_DAILY_BACKUP_03_ULN"

existing="$(crontab -l 2>/dev/null || true)"
if grep -Fqx "$cron_line" <<<"$existing"; then
  echo 'RAG daily backup cron is already installed.'
  exit 0
fi
if grep -Fq 'RAG_DAILY_BACKUP_' <<<"$existing"; then
  echo 'A different RAG daily backup cron entry already exists; inspect crontab before changing it.' >&2
  exit 1
fi

tmp_crontab="$(mktemp)"
trap 'rm -f "$tmp_crontab"' EXIT
if [[ -n "$existing" ]]; then
  printf '%s\n' "$existing" > "$tmp_crontab"
fi
printf '%s\n' "$cron_line" >> "$tmp_crontab"
crontab "$tmp_crontab"
echo 'Installed RAG daily backup cron: 03:00 Asia/Ulaanbaatar (19:00 UTC).'
