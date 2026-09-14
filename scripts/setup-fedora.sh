#!/usr/bin/env bash
# Run as your normal user: bash scripts/setup-fedora.sh
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

source /etc/os-release
if [[ "${ID:-}" != fedora ]]; then
  echo "This installer is for Fedora. See docs/LOCAL_SETUP.md." >&2
  exit 1
fi
if (( EUID == 0 )); then
  echo "Run as your normal user; only the system package step uses sudo." >&2
  exit 1
fi

# Official repositories only; do not change unrelated third-party repositories.
sudo dnf --repo=fedora --repo=updates install -y \
  nodejs24 nodejs24-npm nodejs24-devel gcc-c++ make python3 \
  golang jq android-tools poppler-utils \
  latexmk texlive-xetex biber \
  texlive-collection-latexextra texlive-collection-bibtexextra \
  texlive-collection-fontsrecommended texlive-algorithms texlive-algorithmicx \
  liberation-serif-fonts liberation-sans-fonts liberation-mono-fonts

# Use the project's declared pnpm version; frameworks stay local to the workspace.
pnpm_spec=$(node -p 'require("./package.json").packageManager')
npm install --global --prefix "$HOME/.local" "$pnpm_spec"
export PATH="$HOME/.local/bin:$PATH"
pnpm install --frozen-lockfile

printf '\nDependencies installed. For future terminals:\n'
printf '  export PATH="$HOME/.local/bin:$PATH"\n'
printf '\nNext: bash scripts/check-environment.sh\n'
printf 'Then: pnpm typecheck && pnpm build\n'
printf 'Report: pnpm report:build\n'
printf 'API environment and Docker access: docs/LOCAL_SETUP.md\n'
