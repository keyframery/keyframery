# Keyframery: progress and plan

Keyframery is now **Keyframery UI**: animated drop-in primitives for UI SDK (`@ui-sdk/react`), built with plain CSS. Swap the import, keep your UI SDK components.

The old Keyframery product (the `<Cuts />` motion layer for shadcn/ui) is discontinued and its GitHub repo will be removed. The new product replaces it on keyframery.com.

## Decisions (2026-11-15)

- **Plain CSS, no Motion library.** Animate UI uses Motion, so CSS is part of what makes us different. Motion styles are a single setting, and the components work in server-rendered pages. Motion (motion.dev) may be added later only where CSS can't do the job: exit animations and drag.
- **Same domain, same shadcn registry entry.** shadcn's directory lists `@keyframery` with the URL `https://keyframery.com/r/{name}.json`. The new site serves the new components at that URL, so `npx shadcn add @keyframery/<name>` works with nothing sent to shadcn.
  - Their directory description still mentions Cuts. It's cosmetic and can be updated with a PR later.
  - Keep `/r/registry.json` valid: shadcn health-checks the registry.
- **Tonight's launch is the core launch.** It covers 60 components, the 4 motion styles, docs for every component, a working registry install, and a style switcher on the site.

## Decision (2026-11-16): UI SDK's components only

The owner's words: "we need all ui sdk component only as we are motion for ui sdk", then "support of all ui sdk features and its apis with latest version". So the set is exactly UI SDK's 55 components, under UI SDK's names, on the newest published UI SDK. Anything UI SDK has no component for is out. Later sections that mention 60, 61 or 62 components, Sidebar, Table, Card, Badge, Kbd, Skeleton, Context Menu or Motion Style as components describe the site before this.

## UI SDK's 55, on 0.1.0-beta.5 (2026-11-16)

- **Removed:** Badge, Card, Kbd, Sidebar, Skeleton, Table, and Context Menu and Motion Style as separate components.
  - Context menus are part of Menu (`MenuContextTrigger`). The styled Menu notices a menu that only opens from a right-click area and unfolds it from the pointer; the primitive exports `contextMenuMotion` for the same thing by hand.
  - The motion style switcher lives in the new **Preferences** component (`MotionStyle`, `MotionStyleSwitcher`, `motionStyle`, `createMotionStyle`), next to a generic `PreferenceSwitcher`.
- **UI SDK 0.1.0-beta.5** in `package.json`; the registry pins it. npm tags on the day: `latest` = beta.3, `beta` = beta.5; GitHub main was already at beta.6 with the same 68 entries.
- **API coverage, measured:** 55 component entries, 377 parts. Every runtime export is reachable from both layers and every styled part takes every UI SDK prop with the same types. The audit script was run from the scratchpad (not in the repo): it writes a temporary `src/__api_audit__.ts` of type aliases and reads them back with the TypeScript checker.
  - Added to the styled layer: `TabsTabIcon`, `TabsIndicator`, `CommandItems`, every `create…Controller`, `confirm`, `createConfirm`, `sheetPhysics`, `resizableStorageKey`, the tree helpers.
  - `mapChildren` in `src/lib/keyframery.tsx` lets a styled part that adds its own element (chevron, key) take `children` as a function of state: AccordionPanel, MenuSubTrigger (menu and menubar), NavigationMenuTrigger, SelectTrigger, SegmentedControl, TabsList.
  - Data mode (`items`): Menu and Menubar render their own styled content, Listbox and CommandList render styled rows.
- **Not components, so not wrapped:** UI SDK's helper entries (`date`, `color`, `number`, `image`, `gesture`, `text-match`, `primitive`, `agent`, `observe`, `history`, `shortcuts`, `async-options`, `overlays`). They are used straight from `@ui-sdk/react/*`. One known gap (read in UI SDK's source, not yet built): UI SDK's `OverlayHost` draws the shared `confirm()` with its own unstyled alert dialog, so that call does not get Keyframery's look. `createConfirm()` with Keyframery's AlertDialog does, and `toast()` shows in Keyframery's `ToastRegion` once one is placed, because a placed region takes over from the host. A Keyframery `OverlayHost` would close it; it needs `toasterInternals` from `@ui-sdk/core/renderer` to know whether a region is already placed.
- **Redirects, all 301 now** (`statusCode: 301` in `next.config.ts`, old Cuts URLs included): the six retired pages go to `/docs/components`, `context-menu` to `menu`, `motion-style` to `preferences`, with their `.mdx` and `.md` copies; `/r/context-menu.json` and `/r/motion-style.json` go to the new items. The six retired registry items return 404.
- **Checked:** both type-checks, the production build, every redirect and key page on a local `next start`, all 55 demos played in the lab with no console errors, and the new examples (context menu, menu, command and listbox as data, tabs with icons) looked at in the built docs.
- **Version text left alone on purpose:** the guide and blog sentences that report tests run on beta.2 still say beta.2, because those tests were not re-run.

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
- [x] Live on keyframery.com since 2026-11-15. Deployed with the Vercel CLI (`vercel deploy --prod` from the repo root; `.vercelignore` keeps uploads small). Rollback target, the old Cuts site: `dpl_2ZyYZKTzUfvsjHZ9YfDRxLGsWw4H`.

## Live (2026-11-15)

- keyframery.com serves this repo. Vercel project settings were changed: Root Directory is now the repo root (was `apps/web`), and the build command is `pnpm build`.
- Pushes don't auto-deploy yet. Linking the repo failed because the Vercel account needs a GitHub Login Connection; the user has to add it. Until then, deploy with `vercel deploy --prod --scope briyanpatels-projects`.
- Checked on the live domain:
  - all pages and registry items return 200
  - old URLs redirect
  - `*.vercel.app` forwards to keyframery.com
  - GA4 and Cloudflare Web Analytics both load
  - robots.txt is served unmodified
- Cloudflare returns 403 for the bare `Python-urllib` user agent only. AI crawlers, node, curl and python-requests all get 200.
- Old project env vars (`DATABASE_URL`, `CF_API_TOKEN`, `KEYFRAMERY_ADMIN_PASSWORD` and others) are still set on Vercel but unused. They can be removed.

## Social previews (2026-11-15)

- The shared site cover is now `public/og/keyframery-ui-v1.png`: a 1200×630 capture of real tabs, slider and switch components, with the current UI SDK positioning.
- Open Graph and Twitter share the versioned image URL. The old `/opengraph-image` address redirects to it; docs and blog posts keep their own cards.
- Regenerate with `node scripts/social-cover/capture.mjs` (requires Chrome). Its source is under `scripts/social-cover/`; the temporary page and generated dev types are removed after capture.
- Verified the production build, both TypeScript configurations, all 80 sitemap pages' social tags, and home-page tags for Twitter, Facebook, Slack and browser user agents. The cover route is absent from production.
- Existing platform previews may remain cached until the platform scrapes the page again. Deployment still uses the Vercel CLI as described above.

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
- Agent readiness (Cloudflare isitagentready checks):
  - robots.txt has Content-Signal plus named AI crawlers
  - Link headers on `/`
  - Markdown negotiation on `/`, docs and blog (`/index.md`)
  - `/.well-known/api-catalog`, `ai-catalog.json` and `agent-skills/index.json`, plus `/auth.md`
  - `/llms.txt` lists the blog
  - Content-Signal costs Lighthouse SEO 8 points ("unknown directive"). That's a deliberate trade-off; Google ignores unknown directives.
- Tracking: GA4 `G-R8KDF02XF8` is in `app/layout.tsx` (production only). Search Console is a domain property (no meta tag needed). Cloudflare Web Analytics is auto-injected by the Cloudflare proxy. Clarity from the old site was not ported (it was opt-in only).
- New post: `/blog/what-is-vercel-ui-sdk`, targeting "Vercel UI SDK". Scored with ~/.claude/skills (blog analyzer, 79/100 on the MDX alone; schema is added by the page template). It's linked from the docs intro.
- SEO crawl (scratchpad audit.mjs logic: titles, descriptions, canonicals, h1, heading order, JSON-LD, alt, broken and orphan links): 80 pages, 0 critical/high/medium.
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

## Sidebar and demo clean-up (2026-11-15, late)

- **Sidebar** is component 61: `primitives/sidebar.tsx`, `ui/sidebar.tsx`, `demos/sidebar.tsx`. UI SDK has no sidebar, so it is plain elements with shadcn's part names (like Card). Moves: Glide (the active key, anchored to `[data-active]`), Height (collapsible groups reuse the collapsible primitive), the rail collapse, Press. The mobile sheet came in 1.2 (below).
- **Demos no longer look generated** (reviewed against the stageshow skill's craft rules): CSS-painted "photos" and drawn SVG faces were replaced with real photos in `public/demo/` (Unsplash licence, fetched via picsum.photos). The shared Lisbon cast was replaced by a different setting per demo. Initials in squares were replaced by photos where they acted as logos.
- Component counts on the site and in the skill now say 61; the changelog has a 1.1 entry.

## Speed, Table and fuller docs (2026-11-16)

- `speed` prop on every component's top-level part (and RadioGroup, CheckboxGroup, ToggleGroup), from `src/lib/keyframery.tsx`: `Speed` wrapper (display: contents span, only when speed is set), `useSpeedStyle` for portal parts, `withSpeed`, `KeyframeryProvider`. Ships with the motion registry item as `lib/keyframery.tsx`.
- Sidebar highlight glide 460ms -> 260ms.
- Table: 62nd component (`primitives/table.tsx`, `ui/table.tsx`, demo, 5 examples).
- Docs pages (scripts/build-docs.mjs): CLI/Manual install tabs, usage from `src/examples/<slug>/usage.tsx`, anatomy tree parsed from it, examples from `src/examples/<slug>/<nn>-<name>.tsx` (first `//` line is the title, the rest the description), Motion with speed, API reference read from the types by `scripts/lib/props.mjs` (missing descriptions in `content/prop-docs.json`), hooks, keyboard from `content/keyboard.json`.
- The dev server can run out of memory with every example; the production build is fine.

## Phone layouts (2026-11-16)

- **Demos are fluid.** Roots are `w-full max-w-[N]`; phone layouts use container queries (`@container` on the demo root, `@max-[..]:` inside), so the example code users copy is responsive too. The docs frame (`site/components/demo.tsx`) no longer shrinks demos to fit; zoom is only a fallback for the landing grid's fixed-height cells. On a phone the frame padding drops to 16px.
- **Real phone designs**, not squeezes:
  - navigation-menu: breadcrumb plus a menu button that drops the sections down as an accordion
  - card: stacks
  - listbox: stacks
  - waterfall: drops the time column and keeps three axis ticks
  - resizable: splits top and bottom
  - command: hides keyboard hints
  - button: rows wrap
- **Sidebar sheet:** `SidebarProvider mobileBreakpoint` (640 by default, measured on the provider). Below it, the sidebar is an off-canvas sheet with a scrim; `useSidebar` adds `isMobile`, `openMobile` and `setOpenMobile`. The demo uses 480 because its window is only 600px wide.
- **Autoplay:** a `PlayStep` can be `only: "wide" | "narrow"` (narrow is under 520px), so a demo plays its own phone flow.
- **Docs:** a Desktop/Mobile switch on each component preview (hidden on phones) draws the demo in a 390px frame.
- **Lab:** `?w=390` draws the stage at phone width with 16px gutters, for checking.
- All 59 demos were checked at 390px, including every popup while playing, plus dark mode for the redesigned ones.

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
7. **Track UI SDK beta changes.** Re-run the type-check, the API audit and the demos on every UI SDK release. Last done for 0.1.0-beta.5 on 2026-11-16.

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
