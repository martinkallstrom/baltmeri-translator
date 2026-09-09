#!/usr/bin/env bash
# Copy the project page (docs/index.html + docs/site) into the Worker's static assets as /about.
set -euo pipefail
cd "$(dirname "$0")/.."
rm -rf public/about && mkdir -p public/about
cp -R docs/site public/about/site
# In the Worker the PDF lives at /paper/…, the manual and decisions at /docs/…
sed -e 's#href="paper/baltmeri-paper.pdf"#href="/paper/baltmeri-paper.pdf"#g' \
    -e 's#href="baltmeri_manual.md"#href="https://github.com/martinkallstrom/baltmeri-translator/blob/main/docs/baltmeri_manual.md"#g' \
    -e 's#href="decisions.md"#href="https://github.com/martinkallstrom/baltmeri-translator/blob/main/docs/decisions.md"#g' \
    -e 's#<meta name="description"#<meta name="robots" content="noindex, nofollow">\n<meta name="description"#' \
    docs/index.html > public/about/index.html
mkdir -p public/paper && cp docs/paper/baltmeri-paper.pdf public/paper/baltmeri-paper.pdf
echo "synced public/about and public/paper"
