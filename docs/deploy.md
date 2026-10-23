# Deploying keyframery.com

Deployed to https://keyframery.com on 8 October 2026: Vercel project `keyframery` (team briyanpatels-projects), DNS at GoDaddy (`A @ 216.198.79.1`, `CNAME www` to Vercel, email records unchanged), Web Analytics on.

Pro and its waitlist are switched off (`PRO_ENABLED` in `apps/web/lib/pro.ts`). The Neon database (section 2) still supports aggregate usage measurement and `/admin`. Keyframery is in shadcn's registry index (merged 8 October 2026 in https://github.com/shadcn-ui/ui/pull/12207), so `npx shadcn add @keyframery/cuts` works without `registry add`. The docs keep `registry add` only as the fallback for `Unknown registry "@keyframery"`.

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

## Mobile performance

The 23 October 2026 mobile PageSpeed report scored 68. Source fixes defer search until it opens, stop the homepage from prefetching the docs' full demo registry, delay Google Analytics until after load, prioritize the heading's font, and batch the two demo cursors' layout reads. Search ranking stays shared with WebMCP without importing the search UI.

Keep CSS in Next.js's separate immutable assets. Enabling `experimental.inlineCss` repeated about 311 KB of CSS in both the HTML and React's serialized payload, making the homepage about 1.18 MB uncompressed. External styles reduce that HTML to about 227 KB. In local Lighthouse 13.5.0 mobile runs with the same default settings, the changes improved performance from 55 to 86, LCP from 6.3 to 3.8 seconds, blocking time from 760 to 160 ms, and transferred bytes from about 859 to 445 KB. These local results exclude production analytics and Cloudflare injection; they are not a new live PageSpeed score.

`PublicEmail` adds Cloudflare's documented `email_off` comments around the public contact link and the hero's demo addresses. This prevents email rewriting and its blocking decoder without changing the address or requiring client JavaScript. Do not use `Cache-Control: no-transform` for this: Next.js's compression middleware also honors it, leaving the large HTML uncompressed. After deployment, verify the mail link and demo addresses, gzip/Brotli response compression, and absence of `email-decode.min.js` on the homepage. See [Cloudflare's email obfuscation documentation](https://developers.cloudflare.com/waf/tools/scrape-shield/email-address-obfuscation/#prevent-cloudflare-from-obfuscating-email).

The remaining Cloudflare beacon cache lifetime and legacy code in Cloudflare/Next.js/React are vendor-controlled. Do not rewrite vendor bundles or remove framework polyfills just to suppress an audit. Separate stylesheets can still appear as render-blocking; the comparison above favors the smaller document and cacheable CSS. Run `pnpm check:site` before deploying these site-only changes, then rerun the live mobile PageSpeed report to include the CDN and production scripts.

The footer's CodeHype badge is pinned locally as `public/codehype-keyframery-v20.svg` because the remote image host intermittently returns 403 to Safari. The original product attribution link stays intact. Its versioned path has a one-year immutable cache policy; use a new filename if replacing the artwork.

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
5. Page views and performance use the existing **Cloudflare Web Analytics** beacon. Verify that one beacon is emitted per page and that Cloudflare receives it; enabling Vercel Web Analytics alone does not verify this collector. Copy actions use the separate first-party aggregate endpoint described below. No `cuts_switch`, `slowmo`, `director_stop` or waitlist custom-event collection is implemented.

## 2. Neon database (usage counts and optional Pro waitlist)

1. Add the Neon integration in Vercel, or create a database at neon.tech.
2. Set `DATABASE_URL` for Production and Preview.
3. Run `apps/web/db/usage.sql` in the Neon SQL editor, or explicitly run `node apps/web/scripts/migrate-usage.mjs --apply` from the repo root with the intended `DATABASE_URL`. Rerun it on existing databases to add the copy-event kinds to the table constraint; the script preserves existing counters. The CLI reads the reviewed SQL relative to its own file, limits lock waits to 3 seconds and statements to 10 seconds, locks the table while comparing row/event totals, and verifies the new kinds. SQL failures roll back the transaction; a failed post-commit verification is reported as committed and requires inspection. Missing or invalid arguments exit before any database connection. The app does not create or migrate this table. For a one-deployment Vercel override, use `cd ../.. && pnpm registry:build && node apps/web/scripts/migrate-usage.mjs --apply && pnpm -C apps/web build`; leave the project's normal build command unchanged.
4. If Pro is enabled later, the first signup creates the waitlist table with `create table if not exists waitlist (email text primary key, source text not null, created_at timestamptz not null default now())`.

Without `DATABASE_URL`, signups go to `apps/web/.data/waitlist.jsonl`. That's fine locally, but on Vercel the file system doesn't persist, so set the variable before launch.

The database holds the usage counts that `/admin` reads: registry GETs, MCP calls, agent reads and successful copies (see `apps/web/lib/usage.ts`). Without `DATABASE_URL` or the table, counts are not persisted. An old table constraint rejects copy events until the SQL script is rerun; check server warnings and actual rows after deployment.

## Admin dashboard (/admin)

One password, no accounts. Set these for Production (values never appear on the page; its Setup card shows which are set):

| Variable | What it unlocks |
|---|---|
| `KEYFRAMERY_ADMIN_PASSWORD` | the page itself; 24+ characters, or /admin stays closed. Changing it signs everyone out. |
| `DATABASE_URL` | registry GETs (Cuts separate from other files; CLI-like / browser / crawler / other), successful copy actions, MCP tool calls and clients, agent reads (Markdown, llms.txt, .well-known) |
| `CF_API_TOKEN`, `CF_ACCOUNT_ID` | site traffic from Cloudflare Web Analytics (token permission: Account Analytics: Read) |
| `GITHUB_TOKEN` | GitHub views, clones and referrers (a fine-grained token on keyframery/keyframery with Administration: Read-only). Stars work without it. |

Registry and agent counting starts in `proxy.ts` with background work; it does not establish successful response completion. MCP counting runs through `app/mcp/route.ts`. These counts never fail the request. Registry GETs are download proxies, not confirmed installations or unique developers; client classification is approximate. The `install` database kind is retained for historical registry counts. Do not divide unrelated daily copy, download and Cloudflare visit totals into an organic conversion rate.

Successful clipboard writes POST to `/api/events` using same-origin JSON, without cookies or referrers. The endpoint validates origin, body size and a fixed event/page/component allowlist before scheduling a daily increment. It rejects cross-site browser writes but is a public aggregate counter, so scripted requests and repeated actions can inflate it. HTTP 204 means accepted for best-effort counting, not confirmed database persistence. No identities, clipboard contents, query strings or theme settings are stored. The privacy page describes both collection paths.

| Stored `kind` | `item` (page) | `client` (component) |
|---|---|---|
| `install_copy` | `/` | `install-command` |
| `agent_prompt_copy` | `/` | `agent-prompt-button` |
| `install_copy`, `agent_prompt_copy`, `theme_copy`, `theme_share` | `/theme` | `theme-builder` |

After deployment, copy one install command successfully, query its row in `usage_counts` and confirm the count increases by one. Block clipboard access and retry: the UI must report failure and the row must stay unchanged. Repeat with an agent prompt and a theme copy, then verify a registry GET and an MCP tool call independently. Database connectivity, production table migration and event receipt need this live check; local browser requests alone cannot verify persistence.

## Optional Microsoft Clarity

Clarity is independent of Cloudflare and the aggregate copy counters. It loads only after an explicit visitor opt-in through **Analytics preferences** on `/privacy`. There is no automatic opt-in or consent banner. No Microsoft script, preconnect or collection request is added before consent. No dependency is required.

1. Create/select the actual Clarity project and complete its account setup. In **Settings → Setup**, enable Consent Mode by turning off cookies being set by default. In **Settings → Masking**, select **Strict**. Do not enable any unmasking selectors. These are account settings; code alone does not verify them.
2. Set `CLARITY_PROJECT_ID` to the project's public ID in **Vercel Production only**. There is no default project ID. The server passes a validated ID only when `VERCEL_ENV=production`; the client additionally requires `keyframery.com` or `www.keyframery.com`. Local and Preview builds stay disabled. The existing automatic Cloudflare beacon remains separate; do not install another Clarity snippet through Bing, a tag manager or the layout.
3. Deploy and inspect `/privacy`. With a clean browser profile, verify no `clarity.ms` requests before **Allow optional analytics**. After opt-in, verify one tag and expected collection calls, navigate through public routes and confirm the tag is not added twice. Verify the actual Clarity dashboard receives only masked public-page data; test success is not proof of live receipt.
4. Choose **Turn off optional analytics**. The integration stops the runtime first, removes the pending tag, clears this site's `_clck`/`_clsk` cookies and prevents restarts in that document. It replaces the global API with an inert shutdown sentinel containing denied consent plus a stop; this is a local shutdown state, not a receipt from Microsoft. The vendor's bootstrap/version guards prevent a late tag or runtime response from starting again. An in-flight request already sent cannot be recalled. Re-enabling after withdrawal takes effect on a full new page load. Third-party Microsoft-domain cookies cannot be removed from this site's origin.
5. Visit `/admin` directly and through SPA navigation after opting in. Direct entry must not load a tag; client transitions must stop the active runtime before admin DOM observers run. Preference expiry or cross-tab withdrawal must stop it as well.

The explicit preference is stored locally under `keyframery:clarity:v1` for 180 days (under the documented nine-month maximum), with no identity. Invalid, expired or inaccessible storage means off. Failed writes fail closed for that document. Advertising storage is always denied using the API's exact `ad_Storage` key; only `analytics_Storage` can be granted. No `identify`, custom session ID, custom tag or custom event is sent. The whole document body carries `data-clarity-mask="true"`; inputs are also masked by Clarity. Keep the privacy disclosure, project configuration and masking settings consistent.

Primary references: [Consent management](https://learn.microsoft.com/en-us/clarity/setup-and-installation/consent-management), [ConsentV2 API](https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-consent-api-v2), [masking](https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-masking), and Microsoft's [runtime stop](https://github.com/microsoft/clarity/blob/master/packages/clarity-js/src/clarity.ts), [consent lifecycle](https://github.com/microsoft/clarity/blob/master/packages/clarity-js/src/data/metadata.ts) and [inactive queue](https://github.com/microsoft/clarity/blob/master/packages/clarity-js/src/queue.ts) implementations. Denying consent while active schedules a cookieless restart; stopping first avoids scheduling it. Preserve this ordering and its deferred-restart regression test when updating the integration.

## 3. Domain

1. In Vercel, open the project's **Domains** settings and add `keyframery.com` and `www.keyframery.com` (redirect www to the apex).
2. At the registrar, set the records Vercel shows. Usually that's an `A` record for the apex to `76.76.21.21` and a `CNAME` for `www` to `cname.vercel-dns.com`.
3. Check `https://keyframery.com/r/cuts.json` returns JSON. That's the URL the shadcn CLI installs from.

## 4. Going public

1. Make `keyframery/keyframery` public on GitHub.
2. Tag the release: `git tag v0.1.0 && git push --tags`, and date the changelog entry.
3. Submit Keyframery to shadcn's registry index (a PR to `apps/v4/registry/directory.json` in shadcn-ui/ui), so `npx shadcn add @keyframery/cuts` works without editing `components.json`.
