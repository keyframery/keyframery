# Organic growth operations

Prepared 19 October 2026. This kit implements the operational and distribution work from the approved SEO/AEO plan dated 19 October 2026. It contains reviewable assets and blank measurement templates. Private account observations from this implementation are recorded in `.reports/seo/2026-10-19/account-audit.md`, with the Search Console export in `.reports/seo/2026-10-19/search-console-performance.zip`; these ignored local artifacts are not public metrics. Creating this kit did not submit material, publish placements or run AI samples.

## Start here

| Deliverable | Use |
|---|---|
| [Three example distribution packages](distribution.md) | Tutorial outlines, community/social drafts and captioned-demo shot lists linked to existing docs |
| [Outreach research](outreach.md) | Checked submission routes, existing listings and relevant editorial opportunities |
| [AI visibility protocol](ai-visibility.md) | Monthly sampling, scoring and interpretation |
| [Fixed prompts](ai-prompts.csv) | Twelve unbranded questions; preserve IDs and wording between rounds |
| [AI observation log](ai-observations.csv) | One row per prompt run and citation, including negative results |
| [Scorecard template](scorecard.csv) | Consistent metric definitions; blank values mean unmeasured |

The homepage owns both **Keyframery** brand lookup and the category cluster **shadcn animation library**, **shadcn animations** and **shadcn/ui animations**. A developer searching the project name should find the official site, understand the product and reach its official docs or repository. Keep the brand name, product description and official links consistent across the homepage, GitHub and genuine listings; use the existing homepage rather than creating extra branded landing pages.

The priority task pages are [Dialog](https://keyframery.com/docs/components/dialog), [Tabs](https://keyframery.com/docs/components/tabs), [ListCut](https://keyframery.com/docs/helpers/list-cut) and [Troubleshooting](https://keyframery.com/docs/guides/animations-not-working). [LoadCut](https://keyframery.com/docs/helpers/load-cut) supports the loading example. Category priorities follow product fit; no search volume or ranking baseline is assumed. Measure brand lookup separately from nonbrand acquisition so growth in people already looking for Keyframery does not obscure discovery performance.

## Establish a baseline

The maintainer owns account access. Search Console owner access and a dated baseline export were verified during this implementation. Preserve the ignored `.reports/seo/` evidence or copy it into private storage outside the repository, for example `~/keyframery-growth-private/2026-10-19/`. Store only sanitized summaries in public changes. Never put credentials, personal information or access-bearing report links in this kit.

Use the latest complete 28-day range available in each source, and record any reporting delay. For a baseline ending 18 October, the intended ranges are **21 September–18 October 2026** and **24 August–20 September 2026**. If the site has less history, use the available range and label it partial. Copy counters added in this implementation have no retrospective history. Preserve source timezones: the usage table uses UTC days; Google reports use their documented reporting timezone. Do not silently join daily totals across sources.

1. **Google Search Console:** choose the verified property for `keyframery.com`. Save the property name, access role, export date and actual available range. In Search results, select web search, retain all four metrics, and export Queries, Pages, Countries, Devices and Dates. Record filters. For each priority URL, filter to that exact page and export its query table; this gives a useful query/page pairing. A single UI export is not a complete query × page × device × country dataset. Google describes the metrics, dimensions and export controls in its [Performance report documentation](https://support.google.com/webmasters/answer/7576553).
2. Separate branded queries containing case-insensitive `keyframery` from nonbrand queries. Within the branded set, report exact `keyframery` after trimming whitespace separately from close navigational queries such as `keyframery docs`, `keyframery github` or `keyframery.com` when those queries occur in the export. Keep these groups disjoint: exact brand, other brand-containing queries and nonbrand. Review actual spelling variants before extending the rule, and save the rule with every snapshot. Hidden/anonymized queries and report limits mean query-table sums may differ from totals; preserve original totals and avoid inventing missing queries or search demand.
3. **Indexing:** save sitemap submission state for `https://keyframery.com/sitemap.xml`. Inspect the homepage, installation page and four priority docs. Record last crawl, indexing verdict, user-declared canonical, Google-selected canonical and live-test result separately. A live fetch and a submitted sitemap do not establish indexing.
4. **Google AI:** record the effective value under Settings → Search generative AI, including inherited parent state. The [official inclusion control](https://support.google.com/webmasters/answer/16908024) distinguishes inclusion from model-training policy. Export the [Generative AI performance report](https://support.google.com/webmasters/answer/16984139) if available; its documented metric is impressions. Record `insufficient data` if absent. Do not add these impressions to Search results totals, because the reports overlap.
5. **Bing Webmaster Tools:** verify the intended property, record sitemap receipt/status, export the available search performance, and inspect the same priority URLs. Preserve Bing's definitions and date range. Capture what the account actually shows; Google numbers are not a substitute.
6. **Existing analytics and usage:** use the existing `/admin` dashboard and the SQL export below. Record unavailable source cards as unavailable. Check Cloudflare page-view receipt and whether automatic and manual beacons overlap before interpreting visits. Browser analytics and aggregate action counters do not share a visitor/session key.
7. **GitHub:** preserve repository traffic/referrers while available and record each export range. Keep stars separate from visits, clones and actual project adoption. Save evidence of earned referring pages; an outreach candidate is not an earned link.

Create a small manifest alongside each private export: `source`, `property`, `range_start`, `range_end`, `timezone`, `filters`, `exported_at`, `deployed_commit`, `release_notes`, `missing_data` and `filename`. Fill the scorecard only from these saved sources; a blank baseline is not zero.

## Verify aggregate usage receipt

The application uses `DATABASE_URL` and the manually managed `apps/web/db/usage.sql` schema. Existing databases must rerun that script to extend the allowed event kinds before copy events can persist. Its counter writes fail without breaking the requested page, so a successful browser response or the event endpoint's `204` alone does not prove persistence. Use the existing database console with read access to export the rows; do not expose the connection string in a command or screenshot.

```sql
-- Raw daily aggregates for an explicit, complete UTC range.
select day, kind, item, client, count
from usage_counts
where day >= date '2026-09-21' and day < date '2026-10-19'
order by day, kind, item, client;

-- Main entrypoint requests, separate from helper/dependency requests.
select day, item, sum(count) as cli_like_registry_gets
from usage_counts
where kind = 'install' and client = 'cli'
  and day >= date '2026-09-21' and day < date '2026-10-19'
group by day, item
order by day, item;

-- Successful copy/share actions: keep each event and stored item separate.
select day, kind, item, client, count
from usage_counts
where kind in ('install_copy', 'agent_prompt_copy', 'theme_copy', 'theme_share')
  and day >= date '2026-09-21' and day < date '2026-10-19'
order by day, kind, item;
```

The historical database key `install` means a registry GET. Report `item = 'cuts'` separately from helpers/dependencies and keep `client = 'cli'` separate from browsers, scripts and named bots. User-agent classification is approximate and can be spoofed. Requests are not confirmed installs, unique developers or successful application integration; counting also does not establish completed response delivery.

For copy events, `kind` is the event name, `item` is the page (`/` or `/theme`), and `client` is the emitting component (`install-command`, `agent-prompt-button` or `theme-builder`). These fixed dimensions are visible in `/admin`; it has no export button, so use the SQL export for reproducible snapshots. The same-origin JSON endpoint collects no clipboard content or visitor identity.

After the instrumentation is deployed, note the counter before and after one successful command copy, one successful agent-prompt copy and an intentionally rejected clipboard write in a controlled test. The successful actions should increment their matching counters once; the rejected write should not. Save the deployment SHA, route, event kind, stored item, observed delta and test time. Also check one real registry request and one MCP tool call against storage. Keep controlled test increments annotated, since there is no automatic test-traffic exclusion.

The action endpoint is public aggregate telemetry, so these are directional intent signals with possible abuse. Avoid an organic-install conversion rate: this system has no supported join from a Search Console click to a clipboard action or registry request.

## Monthly scorecard and decisions

Copy [scorecard.csv](scorecard.csv) into the private snapshot and add values plus evidence paths. Use the same ranges, definitions and segments in the next snapshot. Review discovery weekly and AI visibility monthly. A metric is `measured` only when evidence exists; use `unavailable`, `insufficient_data` or `partial` where appropriate.

| Signal | Decision |
|---|---|
| Exact brand lookup does not surface the official homepage | Check homepage indexing/canonical, visible brand definition and consistent official-site/repository identity |
| Priority URL excluded or canonical differs | Diagnose crawl/index/canonical evidence before expanding content |
| Relevant impressions, few clicks | Review actual query intent and snippet; compare similar position/device groups |
| Useful page traffic, weak copy intent | Check the example, prerequisites and next action; verify telemetry first |
| Another existing task page has stronger qualified demand | Promote that page into the next content batch |
| Incorrect AI answer | Record the exact claim and primary-source evidence; improve the relevant existing docs |
| Sparse early data | Extend the observation window; avoid claiming a trend from a few events |

Measure mobile and desktop for `/`, `/docs/components/dialog`, `/docs/helpers/list-cut` and `/theme`. Save dated PageSpeed Insights or Lighthouse results plus environment and deployed SHA. Preserve URL-level versus origin-level field data labels. The field targets are p75 LCP ≤2.5 s, INP ≤200 ms and CLS ≤0.1; lab output is diagnostic evidence, not a measured field INP pass. See [Web Vitals](https://web.dev/articles/vitals) and Google's [Core Web Vitals report](https://support.google.com/webmasters/answer/9205520). Missing field data remains `insufficient_data`.

## Separate branded lookup accuracy check

Keep the twelve unbranded prompts unchanged for discovery measurement. Once a month, run these three branded checks in fresh conversations with the same recorded product/model/search mode and locale:

- `What is Keyframery?`
- `What is the official website for Keyframery?`
- `Where is the official GitHub repository for Keyframery?`

Save the answers and visible citations privately using the observation-log fields, with separate prompt IDs `BR01`, `BR02` and `BR03`. Check the answer against the official site `https://keyframery.com`, repository `https://github.com/keyframery/keyframery` and current product definition: an open-source motion layer for existing shadcn/ui apps, with one root Cuts component and five focused helpers. Record wrong domains, confused products, unsupported claims and missing/incorrect citations. These are accuracy checks after explicitly naming the brand; do not combine them with the unbranded discovery sample or call them evidence of spontaneous recommendations. This kit does not claim that the checks have been run or that the brand ranks first.

## External account work and unresolved state

These checks require the actual account or a real deployment. The private account audit records completed observations and authorized setup actions; other tasks stay open until evidence exists. Bing sitemap submission and the user-authorized Clarity project setup are recorded below. A separately pending Cloudflare AI/WAF proposal was left untouched.

| Task | Verified status/evidence | Remaining work or unknown |
|---|---|---|
| Search Console baseline and indexing follow-up | Verified owner access, saved baseline export and sitemap Success with 92 discovered URLs recorded in the private audit | Full priority-page canonical coverage and remaining excluded-URL diagnoses |
| Google Search generative AI report | Include setting confirmed; dated baseline screenshot and CSV export saved in the private audit | Compare equivalent windows as data grows; impressions are separate from clicks and adoption |
| Bing property and baseline | Sitemap submitted 19 October 2026; rechecked Success with 92 discovered URLs and zero errors/warnings. Private evidence: `.reports/seo/2026-10-19/bing-sitemap-success.jpg` | Indexed-page and search-performance baseline; sitemap discovery does not establish indexing |
| Cloudflare analytics/WAF | Analytics and AI-crawler overview audited; existing crawler-blocking switches observed and private evidence preserved | Controlled browser collection receipt and complete per-route verified-crawler access; overview counts are not citations |
| Microsoft Clarity | User authorized terms acceptance and project creation; project `z04y7t8mey` created. Dashboard Cookies OFF and Strict masking selected and verified; public project ID saved in Vercel Production only; integration passes local checks | Deployment and production collection receipt |
| Usage storage | Collector/admin source and local behavior verified; production database variable listed but no usable value exported | Apply the constraint migration and verify controlled successful/failed copy, registry and MCP storage deltas |
| Performance field data | Search Console currently has no field Core Web Vitals data; preserve four-page mobile/desktop lab evidence separately | Field p75 status; lab output cannot establish it |
| Repository metadata | Initial active CLI account had READ permission; an existing owner credential was later verified with ADMIN permission for deployment. Remote description/topics unchanged | Prepared metadata wording remains below |
| Existing listings | Existing official registry and directory presence checked; stale wording and submission routes recorded in the outreach kit | Maintainer edit access and correction receipt |
| Distribution | Three example distribution packages and outreach research prepared; no external publication or messages sent | Publication dates, placements and impact |
| AI sampling | Separate completed unbranded discovery and branded accuracy logs with answer artifacts and visible citations | Actual model answers and citation accuracy |
| Post-deploy checks and IndexNow | Pre-deployment IndexNow returned HTTP 200 for 92 URLs | Repeat live status/metadata/Markdown parity checks and notify IndexNow after the real deployment; the earlier notification does not cover new deployed content or prove ranking |

Suggested GitHub description: **Open-source motion for existing shadcn/ui apps. One root Cuts component plus five focused helpers.** Suggested relevant topics to review against the current repository: `shadcn-ui`, `react`, `animation`, `typescript`, `nextjs`, `radix-ui`, `base-ui`, `mcp`. These are prepared metadata, not claims that the remote repository was updated.

Keep the existing HTML, Markdown and MCP interfaces useful and consistent. Do not call their fetch counters AI recommendations. Google's [AI guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) says `llms.txt` does not improve its rankings and that special AI schema is unnecessary. Original working examples and accurate answers are the work this kit supports.
