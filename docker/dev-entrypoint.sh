#!/bin/sh
set -e

# node_modules lives in a Docker volume (Linux binaries for Vite/Tailwind/Rolldown),
# so only reinstall when the lockfile actually changes.
hash="$(sha256sum package-lock.json | cut -d' ' -f1)"
marker="node_modules/.lock-hash"

if [ ! -f "$marker" ] || [ "$(cat "$marker")" != "$hash" ]; then
  echo "📦 Installing dependencies (package-lock.json changed)..."
  npm install --no-audit --no-fund
  echo "$hash" > "$marker"
fi

exec "$@"
