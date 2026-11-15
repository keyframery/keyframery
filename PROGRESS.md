# Keyframery: progress and plan

Keyframery is now **Keyframery UI**: animated drop-in primitives for UI SDK (`@ui-sdk/react`), built with plain CSS. Swap the import, keep your UI SDK components.

The old Keyframery product (the `<Cuts />` motion layer for shadcn/ui) is discontinued and its GitHub repo will be removed. The new product replaces it on keyframery.com.

## Decisions (2026-11-15)

- **Plain CSS, no Motion library.** Animate UI uses Motion, so CSS is part of what makes us different. Motion styles are a single setting, and the components work in server-rendered pages. Motion (motion.dev) may be added later only where CSS can't do the job: exit animations and drag.
- **Same domain, same shadcn registry entry.** shadcn's directory lists `@keyframery` with the URL `https://keyframery.com/r/{name}.json`. The new site serves the new components at that URL, so `npx shadcn add @keyframery/<name>` works with nothing sent to shadcn.
  - Their directory description still mentions Cuts. It's cosmetic and can be updated with a PR later.
  - Keep `/r/registry.json` valid: shadcn health-checks the registry.
- **Tonight's launch is the core launch.** It covers 60 components, the 4 motion styles, docs for every component, a working registry install, and a style switcher on the site.

## Launch checklist (tonight)

- [x] 50 components built, reviewed in light and dark, and playing by themselves
- [x] Self-play focus-ring fix and trigger-menu spell-check fix
- [x] Motion tokens: every duration and easing reads from CSS variables (`--kf-speed`, `--ease-house/spring/pop`)
- [x] 4 motion styles (Calm, Springy, Snappy, Playful), switched with `data-motion` on any element
- [ ] 10 new components, to reach 60 (all on disk; context-menu, motion-style and kbd are verified; 7 are still being verified by builders)
- [x] Registry: `node scripts/build-registry.mjs` builds 60 items plus `motion` and `all` to `public/r`
- [x] Install tested in a fresh create-next-app + shadcn init project: tabs, dialog, select and menu install, build and run (re-test all 60 before launch)
- [x] New website (Next.js at the project root: `app/`, `site/`): home, docs intro, installation, motion styles, accessibility, and 60 component pages with live demos, install command, example and source
- [x] Redirects for every old keyframery.com URL (`content/old-urls.txt`, in `next.config.ts`)
- [ ] Deploy and point keyframery.com at the new site (ask the user first)

## Status 2026-11-15 (afternoon)

- The old Cuts repo `keyframery/keyframery` was deleted. A full mirror backup is at `~/keyframery-cuts-backup.git`.
- The new code is pushed to a fresh `keyframery/keyframery` (public, `main`), using the gh account `BriyanPatel`, which is admin.
- The build and type-check pass.
- Lighthouse, after the fixes (mobile, local production build):
  - `/`: perf 77, a11y 100, best practices 100, SEO 100 (CLS went from 0.22 to 0.01)
  - `/docs/components/tabs`: perf 87, a11y 100, best practices 100, SEO 100
  - `/blog/shadcn-skill-vs-mcp`: perf 89, a11y 100, best practices 100, SEO 100
  - The landing's LCP (about 5 s, simulated) is render delay from the live demos' JavaScript, not the photo download.
- Landing changes the user asked for on 2026-11-15:
  - removed the "All 60 components, live" explorer
  - removed the moving light on the closing arc
  - added a full-width "Keyframery" wordmark under the footer that fades top to bottom, with a light band sweeping down
  - fixed the hero board overflowing on phones
  - fixed the hero headline re-wrapping on phones
- The old blog is ported: `/blog`, both posts, `/authors/briyan-hingrajiya`, RSS, social images and `.md` copies, at the old URLs. The skills benchmark post carries an `archived` note, because it tested the old Cuts product.
- Vercel project `briyanpatels-projects/keyframery`, which serves keyframery.com, still has Root Directory `apps/web` and the old build command. Change them to root `.`, `pnpm build` and the pnpm install, and reconnect git, before deploying.

## Restart point (2026-11-15, paused by the user)

**Done, in this order:**
- **Website rebuilt on the old keyframery.com's foundation**, after the user rejected the first version.
  - Fumadocs docs with search, Copy Markdown, a page TOC and prev/next.
  - The old cinematic dark landing look: the orbital sunrise hero, lit buttons, glass tags.
- **Landing page** (`site/components/landing/`):
  - Hero: a rotating word and a board of 6 live components with a motion-style switcher.
  - "Same click, twice": UI SDK with no motion next to Keyframery.
  - The nine moves, as live cards.
  - Motion styles: the cards set the style for the whole page.
  - The skill, with a typing terminal and a "Copy for your coding agent" button.
  - "By hand" in three steps.
  - A live component explorer, replacing the static list.
  - FAQ (Keyframery's own Accordion) and the closing keyframe arc.
- **Docs** (`content/docs/`):
  - Hand-written guides: intro, installation, swap the import, AI tools, motion styles, moves, theming, accessibility, browser support, troubleshooting, changelog.
  - 60 component pages generated by `scripts/build-docs.mjs` from the source plus `content/moves.json`: live preview and code, install, usage, what moves, swap the import, parts, accessibility, source, FAQ.
- **AI:**
  - Skill: `plugins/keyframery/skills/keyframery/SKILL.md`, plus `.claude-plugin/marketplace.json`, also served at `/.well-known/agent-skills/...`.
  - Agent prompt: `site/lib/agent.ts`.
  - `/llms.txt`, `/llms-full.txt`, and `.mdx` on any docs URL. `Accept: text/markdown` works via `proxy.ts`.
- **SEO:**
  - `app/robots.txt` and `app/sitemap.ts` (75 URLs).
  - Social images: a site image plus one per docs page (`/og/docs/.../image.png`).
  - Structured data: Organization, WebSite, SoftwareSourceCode, FAQ, TechArticle and Breadcrumb.
  - Canonicals, privacy and terms pages, a 404 page, and redirects for all 91 old URLs.
- **SEO audit** (`scratchpad seo-audit.mjs`, logic described below): 0 issues.
  - All 75 sitemap pages return 200, each with one h1, a title of 65 characters or less, a description of 50 to 165 characters, a correct canonical, OG and Twitter tags with a working image, and valid JSON-LD.
  - No broken internal links, and all old URLs land on a 200.

**Next, when we restart:**
1. Run Lighthouse on `/` and `/docs/components/tabs` (it was interrupted) and fix what it finds.
2. Screenshot the new landing explorer, privacy, terms and 404 pages, in light and dark, desktop and mobile.
3. Review the landing page on a phone width.
4. The two account blockers before launch:
   - give `deepshah983` Write access to `keyframery/keyframery`, or use another account
   - Vercel is logged in as `briyanpatel`, which owns keyframery.com
5. Then commit (archive the old code to a `cuts-archive` branch first), deploy a preview, and move the domain only after the user says go.

**Run it locally:** `pnpm build && npx next start -p 4640`, then open http://localhost:4640. `pnpm build` runs the registry and docs generators first.

## Fixed during the launch review

- **Self-play focus rings:** while a demo plays itself, the clicked buttons no longer show focus rings.
- **Reduced motion:** 12 components still moved with reduced motion on. All are fixed, and every reduced-motion override is now `!important` so stronger selectors can't beat it. Only loading spinners keep turning, on purpose.
- **Screen readers:** Meter and Progress read out their digit strips ("0 1 2 3 4…"). They now announce the plain value.
- **Kbd hydration:** Kbd no longer causes a server-rendering mismatch when it decides between ⌘ and Ctrl.

## Future plan (after launch)

1. **Motion playground**: live spring and speed controls that every component reacts to, with copy-paste tokens. This fits the name Keyframery.
2. **Signature variants**: 3 to 5 very different versions of the 8 to 10 showcase components (button, tabs, tooltip, dialog, toast, menu, switch, segmented control, carousel). Release them a few at a time as content posts.
3. **Close the CSS gaps**, possibly with Motion only where needed:
   - removed tokens should animate out
   - the calendar's old month should animate out
   - the command palette's back direction
   - the slider track-press spring
4. **Accessibility page and audit**: reduced motion, keyboard focus and screen readers, documented for each component.
5. **Update shadcn's directory description** (cosmetic PR).
6. **Paid blocks and templates** built from the components (hero sections, pricing, settings pages).
7. **Track UI SDK beta changes.** Re-run the type-check and screenshots on every UI SDK release.

## Where things are

- **Lab:** `/Users/briyan/keyframery-ui-lab`. The rules are in `HOUSE.md` and `MOTION.md` (v2 overrides HOUSE.md).
  - `src/components/primitives`: motion primitives with the same parts and props as UI SDK.
  - `src/components/ui`: styled components.
  - `src/demos`: self-playing demos.
- **Screenshots:** `node scripts/shot.cjs <slug> [--play] [--slow 0.1]`.
- **Website:** a Next.js app at the project root.
  - `pnpm build`: registry, then `next build`
  - `pnpm site:dev` (port 4640)
  - The lab still runs with `pnpm dev` (port 4610).
- **Old repo:** `~/keyframery` (being retired). keyframery.com is on a Vercel account or team this machine's CLI isn't logged into.
