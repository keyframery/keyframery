# Deploying keyframery.com

Everything below needs the owner's accounts. The code is ready; nothing has been deployed.

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
