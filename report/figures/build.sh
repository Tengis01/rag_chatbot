#!/usr/bin/env bash
# Анхны Mermaid эхүүдээс default theme-тай диаграмууд үүсгэнэ.
# Хэрэглээ: bash report/figures/build.sh [pdf|png]
set -euo pipefail
cd "$(dirname "$0")"
format="${1:-png}"
case "$format" in pdf|png) ;; *) echo "Usage: $0 [pdf|png]" >&2; exit 2 ;; esac

for f in src/*.mmd; do
  name="$(basename "$f" .mmd)"
  echo "==> $name.$format"
  npx -y @mermaid-js/mermaid-cli@11.17.0 \
    -i "$f" -o "$name.$format" \
    --backgroundColor white --scale 2 --pdfFit
  # C4 renderer-ийн илүүдэл цагаан хүрээг тайрна; дүрслэл/бичвэр хэвээр.
  if [[ "$format" == pdf && "$name" == c4-context ]]; then
    pdfcrop --margins 3 "$name.pdf" "$name-cropped.pdf"
    mv "$name-cropped.pdf" "$name.pdf"
  fi
done
echo "Done."
