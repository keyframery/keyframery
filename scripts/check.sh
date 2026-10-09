#!/bin/sh
# Every check GitHub CI used to run, on this machine. Run it before every deploy: `pnpm check`.
# `pnpm check:site` skips the layer's browser tests (about 20 minutes); use it only when registry/ hasn't changed.
set -e
# Playwright reuses a server already on port 4500, which would test an old build.
lsof -ti tcp:4500 | xargs kill 2>/dev/null || true
pnpm typecheck
pnpm test:unit
pnpm site:build
pnpm -C apps/web exec tsc --noEmit
pnpm -C apps/web lint
pnpm test:site
if [ "$1" != "site" ]; then
  pnpm fixtures:sync
  pnpm fixtures:build
  pnpm test:e2e
fi
# shadcn can change its components on any day. This reports what the fixtures don't cover yet; it doesn't fail the check.
node scripts/drift.mjs || echo "⚠ See the shadcn drift above: re-test before the site names new versions (docs/deploy.md, \"shadcn drift\")."
echo "All checks passed."
