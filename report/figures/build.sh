#!/usr/bin/env bash
# Mermaid эх файлуудаас (src/*.mmd) тайлангийн PNG зургуудыг үүсгэнэ.
# Хэрэглээ: bash report/figures/build.sh
set -euo pipefail
cd "$(dirname "$0")"

for f in src/*.mmd; do
  name="$(basename "$f" .mmd)"
  echo "==> $name.png"
  npx -y @mermaid-js/mermaid-cli \
    -i "$f" -o "$name.png" \
    --backgroundColor white --scale 2
done
echo "Done."
