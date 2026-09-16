#!/usr/bin/env bash
set -euo pipefail

readonly release_script=/home/tengis/rag-chatbot/scripts/deploy/release-ghcr.sh
readonly original_command="${SSH_ORIGINAL_COMMAND:-}"

if [[ "$original_command" =~ ^/home/tengis/rag-chatbot/scripts/deploy/release-ghcr\.sh[[:space:]]([0-9a-f]{40})$ ]]; then
  exec "$release_script" "${BASH_REMATCH[1]}"
fi

printf 'This SSH key only permits a full-SHA RAG release.\n' >&2
exit 64
