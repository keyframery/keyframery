# Deploying keyframery.com

Deployed to https://keyframery.com on 8 October 2026: Vercel project `keyframery` (team briyanpatels-projects), DNS at GoDaddy (`A @ 216.198.79.1`, `CNAME www` to Vercel, email records unchanged), Web Analytics on.

Pro and its waitlist are switched off (`PRO_ENABLED` in `apps/web/lib/pro.ts`), so the Neon database (section 2) is only needed when Pro is switched back on. Keyframery is in shadcn's registry index (merged 8 October 2026 in https://github.com/shadcn-ui/ui/pull/12207), so `npx shadcn add @keyframery/cuts` works without `registry add`. The docs keep `registry add` only as the fallback for `Unknown registry "@keyframery"`.

## How a deploy happens

There is no CI and no deploy on push: the repo is deliberately not connected to Vercel.
1. Run `pnpm check` and read the result: types, lint, unit tests, the site build, the site tests and the layer's browser tests.
   `pnpm check:site` skips the layer's browser tests; use it only when nothing in `registry/` changed.
2. Only if every check passed: commit and push to `main`.
3. Deploy that exact commit from a clean checkout:
   ```bash
   git worktree add --detach ../kf-deploy main
   vercel link --yes --project keyframery --cwd ../kf-deploy
   vercel deploy --prod --yes --cwd ../kf-deploy
   ```
4. Check the live site: key pages, `/r/cuts.json`, `/mcp`, and a screenshot.
5. Run `pnpm indexnow`, which tells Bing (and other IndexNow engines) about every page in the live sitemap. It should print `200` or `202`.

## shadcn drift

Keyframery reads shadcn's markup, so a change upstream can break it. The fixture apps hold every shadcn component as the pinned CLI installed it (`fixtures/tested.json`), and the browser tests run against them. `pnpm drift` (about 20 seconds; `pnpm check` runs it at the end) reports anything they don't cover yet:

- a fixture file that differs from what shadcn's registry gives today, through the pinned CLI or a newer one (the CLI's own `add --dry-run`);
- a component in the registry that `apps/web/lib/coverage.json` doesn't list, or the reverse;
- a new release of a package whose DOM Keyframery reads (`@base-ui/react`, `radix-ui`, `sonner`, `vaul`, `cmdk`). New Next.js, React or Tailwind releases are only listed.

To re-test after it reports something:
1. `SHADCN_VERSION=latest pnpm fixtures:create`, then `git diff fixtures/` shows exactly what shadcn changed.
2. Run `pnpm check`. Fix the engine or the coverage data until it passes.
3. Pin the CLI you tested in `fixtures/tested.json`, run `node apps/web/scripts/gen-tested.mjs` (the site's "Tested with" line and the tested-versions table), and deploy.

## 1. Vercel project

1. Import `keyframery/keyframery` in Vercel.
2. **Root Directory:** `apps/web`. Keep "Include files outside the root directory" on, because the site's build copies `registry/` and `dist/r/` from the repo root.
3. **Build Command:** `cd ../.. && pnpm registry:build && pnpm -C apps/web build`
4. **Install Command:** leave the default (Vercel runs `pnpm install` at the workspace root).
5. Turn on **Web Analytics** for the project. The site already sends page views and these events: `cuts_switch`, `slowmo`, `director_stop`, `theme_copy`, `theme_share`, `waitlist`.

## 2. Neon database (the Pro waitlist)

1. Add the Neon integration in Vercel, or create a database at neon.tech.
2. Set `DATABASE_URL` for Production and Preview.
3. Nothing else: on the first signup the app runs `create table if not exists waitlist (email text primary key, source text not null, created_at timestamptz not null default now())`.

Without `DATABASE_URL`, signups go to `apps/web/.data/waitlist.jsonl`. That's fine locally, but on Vercel the file system doesn't persist, so set the variable before launch.

## 3. Domain

1. In Vercel, open the project's **Domains** settings and add `keyframery.com` and `www.keyframery.com` (redirect www to the apex).
2. At the registrar, set the records Vercel shows. Usually that's an `A` record for the apex to `76.76.21.21` and a `CNAME` for `www` to `cname.vercel-dns.com`.
3. Check `https://keyframery.com/r/cuts.json` returns JSON. That's the URL the shadcn CLI installs from.

## 4. Going public

1. Make `keyframery/keyframery` public on GitHub.
2. Tag the release: `git tag v0.1.0 && git push --tags`, and date the changelog entry.
3. Submit Keyframery to shadcn's registry index (a PR to `apps/v4/registry/directory.json` in shadcn-ui/ui), so `npx shadcn add @keyframery/cuts` works without editing `components.json`.
