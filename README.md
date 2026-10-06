# Keyframery

Film-editing cuts for shadcn/ui. One `<Cuts />` line gives every dialog, sheet, tab and toast a real cut; four small helpers cover lists, values, loading and card-to-detail.

- Site and docs: https://keyframery.com
- Install: `npx shadcn add @keyframery/cuts` (after adding `"@keyframery": "https://keyframery.com/r/{name}.json"` to `components.json`'s `registries`)

## Repo

| Path | What |
|---|---|
| `registry/` | the shipped source: `components/keyframery/*`, `lib/keyframery/*`, `registry.json` |
| `apps/web/` | keyframery.com: Next.js 16 + Fumadocs; uses the registry source directly |
| `fixtures/` | generated test apps: Next.js on Base UI and Radix, plus stock twins |
| `tests/` | Vitest unit tests, Playwright end-to-end tests for the layer (`e2e/`) and the site (`site/`) |

## Commands

```bash
pnpm install
pnpm refresh                 # build the registry, sync and build the fixture apps
pnpm test:unit               # unit tests
pnpm test:e2e                # the layer in 3 browsers × Base UI/Radix × full/reduced motion
pnpm site:build              # build keyframery.com
pnpm site:start              # serve it on http://localhost:4500
pnpm test:site               # site tests (desktop browsers + phone)
pnpm -C apps/web dev         # work on the site with hot reload
```

## License

MIT
