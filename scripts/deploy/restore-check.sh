#!/usr/bin/env bash
# Never restore over production: validate a dump in a newly-created scratch DB.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/../.."
backup=${1:?Usage: restore-check.sh backups/name.dump}
[[ "$backup" == backups/rag-*.dump && -f "$backup" ]] || { echo 'Expected an existing RAG backup path' >&2; exit 1; }
sha256sum -c "$backup.sha256"
check_db="rag_restore_check_$(date -u +%Y%m%d%H%M%S)_$$"
compose=scripts/deploy/compose.sh
"$compose" exec -T postgres createdb -U rag "$check_db"
trap '"$compose" exec -T postgres dropdb -U rag "$check_db"' EXIT
"$compose" exec -T postgres pg_restore --exit-on-error --no-owner --no-privileges -U rag -d "$check_db" < "$backup"
"$compose" exec -T postgres psql -U rag -d "$check_db" -v ON_ERROR_STOP=1 -c 'SELECT count(*) AS document_count FROM documents; SELECT count(*) AS applied_migrations FROM schema_migrations;'
echo 'Scratch restore passed; production database was not modified.'
