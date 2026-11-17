# Keyframery: progress and plan


## Claude handoff completed locally (2026-11-16)

- **82 components, all built on UI SDK:** 55 native SDK entries, 25 UI SDK core definitions and 2 aliases/compositions. Integrated 19 new components from the interrupted Claude session. Both animated and styled layers preserve every native SDK export.
- **Customization is open below the preview by default.** Preview/Code are the only view choices. Every demo has 10–20 controls for real component options, content, colors or dimensions (1,418 declared controls total), plus shared Animation speed. 1× is normal; higher is faster; Reset restores defaults. 576 documented theme variables keep existing light/dark fallbacks when unset.
- Fixed dropped function-based className props in 193 primitive and 454 styled merges; state children, image Blob keys, Select sibling keys, Trace live opening, Bubble overflow and InputGroup inheritance. Custom color variables no longer overwrite message-scroller unread counts or Waterfall marker positions.
- Docs now have searchable categories, SDK badges, focused page headers, related components and theming tables. Landing links lead to useful starting tasks. Aceternity informed the clarity and hierarchy; the site keeps Keyframery's visual language.
- Registry and docs generation integrate component handoff metadata and include core definitions. New local checks cover SDK contracts, control/default consistency, registry dependencies, URL controls and metadata merging. Run `pnpm check`; `pnpm check:browser` requires the lab on :4610.
- Stageshow installed for Codex with `npx skills add https://github.com/benjitaylor/skills --skill stageshow --global --agent codex --yes`. AGENTS.md routes component/docs/landing UI work through `~/.agents/skills/stageshow/SKILL.md`.

**Verification:**207 SDK checks pass; 82 customization and 82 registry entries pass; five metadata/parser regression tests pass; lab and Next type checks pass. Lab and website production builds pass. Browser audit: 328 light/dark/390px/reduced-motion renders and 82 customized-color renders without page exceptions or overflow. Detailed focused captures cover the 19 new components and docs; native slider labels, keyboard/pointer speed, reset, catalog filtering and Preview/Code behavior verified. Final production preview is served locally at `http://localhost:4640`.

**Not committed or deployed.** The public site still serves the earlier deployment. Other frameworks/bases, the proposed admin panel block, Chart and a styled OverlayHost remain follow-on work. Safari/Firefox, a screen-reader session and exhaustive combinations of every control were not tested. Vite's eager lab gallery still emits a large-bundle warning; website demos load on demand. No new project dependency or CI was added.


Keyframery is now **Keyframery UI**: animated drop-in primitives for UI SDK (`@ui-sdk/react`), built with plain CSS. Swap the import, keep your UI SDK components.

The old Keyframery product (the `<Cuts />` motion layer for shadcn/ui) is discontinued and its GitHub repo will be removed. The new product replaces it on keyframery.com.

## Decisions (2026-11-15)

- **Plain CSS, no Motion library.** Animate UI uses Motion, so CSS is part of what makes us different. Motion styles are a single setting, and the components work in server-rendered pages. Motion (motion.dev) may be added later only where CSS can't do the job: exit animations and drag.
- **Same domain, same shadcn registry entry.** shadcn's directory lists `@keyframery` with the URL `https://keyframery.com/r/{name}.json`. The new site serves the new components at that URL, so `npx shadcn add @keyframery/<name>` works with nothing sent to shadcn.
  - Their directory description still mentions Cuts. It's cosmetic and can be updated with a PR later.
  - Keep `/r/registry.json` valid: shadcn health-checks the registry.
- **Tonight's launch is the core launch.** It covers 60 components, the 4 motion styles, docs for every component, a working registry install, and a style switcher on the site.

## Decisions on 2026-11-16, in order

1. Evening: "we need all ui sdk component only as we are motion for ui sdk", then "support of all ui sdk features and its apis with latest version". The eight components UI SDK has no name for were removed, and that went live (commit 2559677) with 301 redirects.
2. About an hour later, after seeing it: "lets bring back what we had", plus a bigger plan (below). The eight are back, so the set is **63: all 55 of UI SDK's, and 8 more** (Badge, Card, Kbd, Sidebar, Skeleton, Table, Context Menu, Motion Style). The redirects for those pages are gone again.

**Historical expansion plan from earlier that evening (current status above):**
- More components: "add 30 more ... get remaining component from shadcn". shadcn's registry has fewer than 30 that Keyframery lacks, so the real list has to be read from shadcn's registry first.
- A badge next to the name of every component that is built on UI SDK (he sent a picture of React Bits' "Updated" pill); components UI SDK has no part for get no badge.
- A Customize section at the bottom of every component page, like React Bits', with sliders ("use this preview slider"), following the four motion styles.
- Demos made with the stageshow skill so they do not look generated.
- Builders: Opus 5.5 at medium effort.
- Then he asked whether Keyframery supports "all language" (UI SDK's other frameworks: Vue, Svelte, Solid, web components) and said he wants the three bases shadcn supports (Radix UI, Base UI, React Aria) as an option too. Today it is React and UI SDK only.

## Every UI SDK component, on 0.1.0-beta.5 (2026-11-16)

- **Removed, then restored the same evening:** Badge, Card, Kbd, Sidebar, Skeleton, Table, Context Menu and Motion Style. Motion Style's two files now only pass through from Preferences, so there is one `motionStyle` object.
  - Context menus are part of Menu (`MenuContextTrigger`). The styled Menu notices a menu that only opens from a right-click area and unfolds it from the pointer; the primitive exports `contextMenuMotion` for the same thing by hand.
  - The motion style switcher lives in the new **Preferences** component (`MotionStyle`, `MotionStyleSwitcher`, `motionStyle`, `createMotionStyle`), next to a generic `PreferenceSwitcher`.
- **UI SDK 0.1.0-beta.5** in `package.json`; the registry pins it. npm tags on the day: `latest` = beta.3, `beta` = beta.5; GitHub main was already at beta.6 with the same 68 entries.
- **API coverage, measured:** 55 component entries, 377 parts. Every runtime export is reachable from both layers and every styled part takes every UI SDK prop with the same types. The audit script was run from the scratchpad (not in the repo): it writes a temporary `src/__api_audit__.ts` of type aliases and reads them back with the TypeScript checker.
  - Added to the styled layer: `TabsTabIcon`, `TabsIndicator`, `CommandItems`, every `create…Controller`, `confirm`, `createConfirm`, `sheetPhysics`, `resizableStorageKey`, the tree helpers.
  - `mapChildren` in `src/lib/keyframery.tsx` lets a styled part that adds its own element (chevron, key) take `children` as a function of state: AccordionPanel, MenuSubTrigger (menu and menubar), NavigationMenuTrigger, SelectTrigger, SegmentedControl, TabsList.
  - Data mode (`items`): Menu and Menubar render their own styled content, Listbox and CommandList render styled rows.
- **Not components, so not wrapped:** UI SDK's helper entries (`date`, `color`, `number`, `image`, `gesture`, `text-match`, `primitive`, `agent`, `observe`, `history`, `shortcuts`, `async-options`, `overlays`). They are used straight from `@ui-sdk/react/*`. One known gap (read in UI SDK's source, not yet built): UI SDK's `OverlayHost` draws the shared `confirm()` with its own unstyled alert dialog, so that call does not get Keyframery's look. `createConfirm()` with Keyframery's AlertDialog does, and `toast()` shows in Keyframery's `ToastRegion` once one is placed, because a placed region takes over from the host. A Keyframery `OverlayHost` would close it; it needs `toasterInternals` from `@ui-sdk/core/renderer` to know whether a region is already placed.
- **Redirects are all 301 now** (`statusCode: 301` in `next.config.ts`), for the old Cuts URLs. The redirects added for the eight removed pages were taken out again when the pages came back.
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

## Docs completion and live landing restoration (2026-11-17)

- User requested restoring the already-live landing after the design exploration. Compared with keyframery.com and restored the original cinematic layout, Inter display type, sunrise hero, original primary agent-copy and secondary browse actions, six-component board and footer. New landing playground removed. Landing count follows the current82-component catalog. No deployment or commit.
- Preserved compact docs with14 native collapsible categories, search, right TOC and previous/next navigation; all82 component URLs remain available.
- Customize stays open, three columns on desktop and one on phones. Controls and speed update both the preview and the displayed/copied installable source. Per-component settings survive browser reload; Reset clears saved overrides.
- Component demonstrations play one pass on first view and have a top-right UI SDK replay button. Replay keeps the selected customization. Desktop/tablet/mobile presets, measured width and pointer/keyboard resizing retain the mounted preview.
- UI SDK Button variants keep the requested subtle vertical gradients and upper/lower shadows. All82 components remain backed by UI SDK behavior;55 native SDK component exports remain complete.
- Verification:26 tests,207 SDK contract checks,82 customization audits and82 install registry entries pass. Both TypeScript configurations pass. Production site and lab builds verified; the lab retains its existing large eager-bundle warning. No separate lint script is configured.
- Handoff details: `.omx/restored-live-landing.md`. Local site: http://localhost:4640 .

## First landing page template: Round (2026-11-17)

- **What it is.** A free landing page template for a made-up bill-splitting app, built to be operated, not only read. Reference given by the owner: sweet-tape.com (an Awwwards site). Only the general lesson was taken from it (a page feels alive when visitors can operate things and the scroll tells a story). The product, look, copy, colours, type, interactions and motion are original; none of its assets or code is used.
- **The page** (`src/templates/round/`, 8 files): a loading sequence where a white ring draws, flies into the hero and peels into one slice per person; a live hero ring (drag a line, add or drop a friend, set the tip, split evenly); a statement that inks in word by word; a bill where tapping a face moves an item between people (four bills); a pinned screen where the scroll drives a screen-wide odometer and ticks off each debt; rolling figures and quotes; pricing with monthly or yearly; questions; closing call and footer. One switch in the top bar re-prices every figure in four currencies. Full-colour sheets stack as you scroll.
- **How it is built.** Controls are Keyframery's UI SDK components (Slider, Toggle, Button, Segmented Control, Accordion). Springs, scroll-linked motion and enter/exit use Motion (`motion` 14.14.0, added at the owner's request: "don't rely only on CSS"). The rest is one scoped CSS file whose durations and easings follow the four motion styles. Copy, people, bills and prices are in `data.ts`; colours are six `--rnd-*` values.
- **Docs.** New sidebar section and top-nav link **Templates**: `/docs/templates` (all templates) and `/docs/templates/round` (breadcrumb, Free tag, Live preview and Copy-for-your-coding-agent buttons, a live framed preview with desktop, tablet and phone sizes and a replay button, then what is on the page, install, make it yours, how it is built). Files: `site/components/templates/`, `site/lib/templates.ts`, `content/docs/templates/`. A docs page becomes a template page with `template: <slug>` in its frontmatter.
- **Live preview route.** `/templates/<slug>` (`app/templates/[slug]/page.tsx`): the template alone, forced to light, not indexed, with a small link back to its docs page.
- **Registry.** `scripts/build-registry.mjs` now builds every folder in `src/templates/` as a `registry:block` (`npx shadcn@latest add @keyframery/round`), with its component dependencies and `motion`. Photos point at keyframery.com in the installed copy.
- **Checked:** `pnpm check` passes (both type-checks, 26 tests, 207 SDK checks, customization, registry) and `pnpm build` passes. Looked at in headless Chrome on the production build: the loading sequence frame by frame, the whole page at 1440px and 390px, dragging a handle, adding a person, the tip, the currency switch, tapping items, switching bills, the odometer at four scroll points, billing switch, questions, and the docs pages at 1440px and 390px. No console errors, no horizontal overflow.
- **Not checked or not done:** Safari and Firefox; reduced motion by eye; keyboard use of the ring handles; the registry install in a fresh project; with JavaScript off the hero stays in its loading state. The ring's handles are plain buttons with slider semantics, not yet a UI SDK core definition. Nothing is committed or deployed.
