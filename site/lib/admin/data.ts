import "server-only"

import { CRAWLER_CLIENTS } from "@site/lib/usage"

import type { AgentsData, Bucket, DownloadRow, EventRow, EventsData, InstallsData, OverviewData, Period, Totals, TrafficData } from "./types"

/**
 * What /admin reads. Two tables, both read-only from here:
 *   usage_counts  (day, kind, item, client, count): daily counters since Oct 2026. Registry downloads ("install"),
 *                 Markdown reads by AI tools ("agent") and copy actions (install_copy, agent_prompt_copy, ...).
 *   usage_events  one row per page view, download, agent read or copy since the event log began (db/analytics.sql),
 *                 with a visitor code that changes every day. Page views and visitors exist only here.
 * Without DATABASE_URL in local development, every function returns labelled sample data, so the pages can be
 * built and checked; in production a missing database is an error shown on the page.
 */

/* Who fetched a registry file. A file named "registry" is a directory's health check, never an install. */
const TOOLS = ["cli", "Claude Code", "Cursor", "Windsurf", "VS Code"]
const CHECKERS = ["script", "other", "unknown"]
const CRAWLERS = [...CRAWLER_CLIENTS]
const COPY_EXCLUDED = ["install", "agent", "mcp"]

export const PERIODS: Period[] = [7, 30, 90]
export const periodOf = (value: string | string[] | undefined): Period => {
  const n = Number(Array.isArray(value) ? value[0] : value)
  return n === 7 || n === 90 ? n : 30
}

/* ---------------------------------------------------------------- days */

const DAY = 86_400_000
const isoDay = (ms: number) => new Date(ms).toISOString().slice(0, 10)
const todayMs = () => Date.parse(new Date().toISOString().slice(0, 10))

/** The current period and the one before it, as UTC days (YYYY-MM-DD). */
function range(days: Period) {
  const end = todayMs()
  const start = end - (days - 1) * DAY
  const before = start - days * DAY
  const list = (from: number, n: number) => Array.from({ length: n }, (_, i) => isoDay(from + i * DAY))
  return { from: isoDay(before), start: isoDay(start), end: isoDay(end), current: list(start, days), previous: list(before, days) }
}

const label = (day: string) => new Date(`${day}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" })

type DayRow = Omit<Bucket, "label" | "from">
const EMPTY: DayRow = { views: 0, visitors: 0, installs: 0, checks: 0, browser: 0, bots: 0, agent: 0, copies: 0 }

/** Days into chart buckets: one per day, or one per week for 90 days. */
function bucketsOf(days: Period, list: string[], byDay: Map<string, DayRow>): Bucket[] {
  const size = days === 90 ? 7 : 1
  const out: Bucket[] = []
  // Weeks end on the last day, so the newest bucket is always a full week.
  for (let end = list.length; end > 0; end -= size) {
    const slice = list.slice(Math.max(0, end - size), end)
    const sum = { ...EMPTY }
    for (const d of slice) {
      const row = byDay.get(d)
      if (row) for (const key of Object.keys(sum) as (keyof DayRow)[]) sum[key] += row[key]
    }
    out.unshift({ ...sum, from: slice[0], label: size === 1 ? label(slice[0]) : `Week of ${label(slice[0])}` })
  }
  return out
}

function totalsOf(list: string[], byDay: Map<string, DayRow>): Totals {
  const t = { ...EMPTY }
  for (const d of list) {
    const row = byDay.get(d)
    if (row) for (const key of Object.keys(t) as (keyof DayRow)[]) t[key] += row[key]
  }
  return t
}

/* ---------------------------------------------------------------- database */

type Sql = (strings: TemplateStringsArray, ...values: unknown[]) => Promise<Record<string, unknown>[]>

async function database(): Promise<Sql | null> {
  const url = process.env.DATABASE_URL
  if (!url) return null
  const { neon } = await import("@neondatabase/serverless")
  return neon(url, { fetchOptions: { signal: AbortSignal.timeout(10_000) } }) as unknown as Sql
}

const sample = () => process.env.NODE_ENV !== "production"
const missing = "DATABASE_URL isn't set, so there is nothing to read."

/** The event log is optional: db/analytics.sql may not have run. Its queries return null when the table is absent. */
async function events<T>(run: () => Promise<T>): Promise<T | null> {
  try {
    return await run()
  } catch (error) {
    if (error instanceof Error && /usage_events/.test(error.message) && /does not exist/.test(error.message)) return null
    throw error
  }
}

const n = (value: unknown) => Number(value ?? 0)
const s = (value: unknown) => (value == null ? "" : String(value))

/* ---------------------------------------------------------------- overview */

export async function overview(days: Period): Promise<OverviewData> {
  const r = range(days)
  const sql = await database()
  if (!sql) return sample() ? sampleOverview(days) : { ...blankOverview(days), error: missing }
  try {
    const [counts, viewRows, since, funnel, pages, referrers, countries, downloads] = await Promise.all([
      sql`select day::text as day,
            coalesce(sum(count) filter (where kind = 'install' and item <> 'registry' and client = any(${TOOLS})), 0)::int as installs,
            coalesce(sum(count) filter (where kind = 'install' and (item = 'registry' or client = any(${CHECKERS}))), 0)::int as checks,
            coalesce(sum(count) filter (where kind = 'install' and item <> 'registry' and client = 'browser'), 0)::int as browser,
            coalesce(sum(count) filter (where kind = 'install' and item <> 'registry' and client = any(${CRAWLERS})), 0)::int as bots,
            coalesce(sum(count) filter (where kind = 'agent'), 0)::int as agent,
            coalesce(sum(count) filter (where kind <> all(${COPY_EXCLUDED})), 0)::int as copies
          from usage_counts where day >= ${r.from}::date group by day`,
      events(() => sql`select (at at time zone 'utc')::date::text as day, count(*)::int as views, count(distinct visitor)::int as visitors
          from usage_events where kind = 'view' and item not like '/admin%' and at >= ${r.from}::date group by 1`),
      events(() => sql`select min(at)::text as first from usage_events`),
      events(() => sql`with v as (select distinct visitor, (at at time zone 'utc')::date as d from usage_events where kind = 'view' and item not like '/admin%' and visitor is not null and at >= ${r.start}::date),
            c as (select distinct visitor, (at at time zone 'utc')::date as d from usage_events where kind = 'copy' and at >= ${r.start}::date),
            i as (select distinct visitor, (at at time zone 'utc')::date as d from usage_events where kind = 'install' and item <> 'registry' and client = any(${TOOLS}) and at >= ${r.start}::date)
          select (select count(*) from v)::int as visits,
                 (select count(*) from v join c using (visitor, d))::int as copied,
                 (select count(*) from v join i using (visitor, d))::int as installed`),
      events(() => sql`select item as path, count(*)::int as views, count(distinct visitor)::int as visitors from usage_events
          where kind = 'view' and item not like '/admin%' and at >= ${r.start}::date group by item order by views desc limit 8`),
      events(() => sql`select referrer as host, count(*)::int as views from usage_events
          where kind = 'view' and item not like '/admin%' and referrer is not null and at >= ${r.start}::date group by referrer order by views desc limit 8`),
      events(() => sql`select coalesce(country, '??') as code, count(distinct visitor)::int as visitors from usage_events
          where kind = 'view' and item not like '/admin%' and at >= ${r.start}::date group by 1 order by visitors desc limit 8`),
      sql`select item, sum(count)::int as count from usage_counts
          where kind = 'install' and item <> 'registry' and client = any(${TOOLS}) and day >= ${r.start}::date
          group by item order by count desc limit 8`,
    ])
    const byDay = new Map<string, DayRow>()
    for (const row of counts) byDay.set(s(row.day), { ...EMPTY, installs: n(row.installs), checks: n(row.checks), browser: n(row.browser), bots: n(row.bots), agent: n(row.agent), copies: n(row.copies) })
    for (const row of viewRows ?? []) {
      const day = s(row.day)
      byDay.set(day, { ...(byDay.get(day) ?? EMPTY), views: n(row.views), visitors: n(row.visitors) })
    }
    return {
      days,
      sample: false,
      error: null,
      eventLog: viewRows !== null,
      eventsSince: since?.[0]?.first ? s(since[0].first).slice(0, 10) : null,
      buckets: bucketsOf(days, r.current, byDay),
      totals: { current: totalsOf(r.current, byDay), previous: totalsOf(r.previous, byDay) },
      funnel: funnel?.[0] ? { visits: n(funnel[0].visits), copied: n(funnel[0].copied), installed: n(funnel[0].installed) } : { visits: 0, copied: 0, installed: 0 },
      pages: (pages ?? []).map((row) => ({ path: s(row.path), views: n(row.views), visitors: n(row.visitors) })),
      referrers: (referrers ?? []).map((row) => ({ host: s(row.host), views: n(row.views) })),
      countries: (countries ?? []).map((row) => ({ code: s(row.code), visitors: n(row.visitors) })),
      downloads: downloads.map((row) => ({ item: s(row.item), count: n(row.count) })),
    }
  } catch (error) {
    return { ...blankOverview(days), error: describe(error) }
  }
}

/* ---------------------------------------------------------------- installs */

export async function installs(days: Period): Promise<InstallsData> {
  const r = range(days)
  const sql = await database()
  if (!sql) return sample() ? sampleInstalls(days) : { days, sample: false, error: missing, rows: [], buckets: [], sweeps: null }
  try {
    const [rows, series, sweeps] = await Promise.all([
      sql`select item,
            coalesce(sum(count) filter (where item <> 'registry' and client = any(${TOOLS})), 0)::int as installs,
            coalesce(sum(count) filter (where item <> 'registry' and client = 'browser'), 0)::int as browser,
            coalesce(sum(count) filter (where item = 'registry' or client = any(${CHECKERS})), 0)::int as checks,
            coalesce(sum(count) filter (where item <> 'registry' and client = any(${CRAWLERS})), 0)::int as bots,
            sum(count)::int as total,
            max(day)::text as last
          from usage_counts where kind = 'install' and day >= ${r.start}::date group by item order by installs desc, total desc`,
      sql`select day::text as day,
            coalesce(sum(count) filter (where item <> 'registry' and client = any(${TOOLS})), 0)::int as installs,
            coalesce(sum(count) filter (where item = 'registry' or client = any(${CHECKERS})), 0)::int as checks,
            coalesce(sum(count) filter (where item <> 'registry' and client = 'browser'), 0)::int as browser,
            coalesce(sum(count) filter (where item <> 'registry' and client = any(${CRAWLERS})), 0)::int as bots
          from usage_counts where kind = 'install' and day >= ${r.start}::date group by day`,
      // A network that fetched 20 or more different files in one day is a sweep (a directory or mirror), not a person.
      events(() => sql`select count(*)::int as visitors, coalesce(sum(files), 0)::int as files from (
            select visitor, (at at time zone 'utc')::date as d, count(distinct item) as files from usage_events
            where kind = 'install' and visitor is not null and at >= ${r.start}::date group by 1, 2 having count(distinct item) >= 20) sweep`),
    ])
    const byDay = new Map<string, DayRow>()
    for (const row of series) byDay.set(s(row.day), { ...EMPTY, installs: n(row.installs), checks: n(row.checks), browser: n(row.browser), bots: n(row.bots) })
    return {
      days,
      sample: false,
      error: null,
      rows: rows.map((row): DownloadRow => ({ item: s(row.item), installs: n(row.installs), browser: n(row.browser), checks: n(row.checks), bots: n(row.bots), total: n(row.total), last: s(row.last) })),
      buckets: bucketsOf(days, r.current, byDay),
      sweeps: sweeps?.[0] ? { visitors: n(sweeps[0].visitors), files: n(sweeps[0].files) } : null,
    }
  } catch (error) {
    return { days, sample: false, error: describe(error), rows: [], buckets: [], sweeps: null }
  }
}

/* ---------------------------------------------------------------- traffic */

export async function traffic(days: Period): Promise<TrafficData> {
  const r = range(days)
  const sql = await database()
  if (!sql) return sample() ? sampleTraffic(days) : { days, sample: false, error: missing, eventLog: false, pages: [], referrers: [], countries: [], clients: [] }
  try {
    const [pages, referrers, countries, clients] = await Promise.all([
      events(() => sql`select item as path, count(*)::int as views, count(distinct (visitor, (at at time zone 'utc')::date))::int as visitors,
            max(at)::text as last from usage_events where kind = 'view' and item not like '/admin%' and at >= ${r.start}::date group by item order by views desc limit 500`),
      events(() => sql`select referrer as host, count(*)::int as views, count(distinct visitor)::int as visitors from usage_events
            where kind = 'view' and item not like '/admin%' and referrer is not null and at >= ${r.start}::date group by referrer order by views desc limit 200`),
      events(() => sql`select coalesce(country, '??') as code, count(distinct (visitor, (at at time zone 'utc')::date))::int as visitors, count(*)::int as views
            from usage_events where kind = 'view' and item not like '/admin%' and at >= ${r.start}::date group by 1 order by visitors desc`),
      events(() => sql`select client, count(*)::int as views from usage_events where kind = 'view' and item not like '/admin%' and at >= ${r.start}::date group by client order by views desc`),
    ])
    return {
      days,
      sample: false,
      error: null,
      eventLog: pages !== null,
      pages: (pages ?? []).map((row) => ({ path: s(row.path), views: n(row.views), visitors: n(row.visitors), last: s(row.last) })),
      referrers: (referrers ?? []).map((row) => ({ host: s(row.host), views: n(row.views), visitors: n(row.visitors) })),
      countries: (countries ?? []).map((row) => ({ code: s(row.code), visitors: n(row.visitors), views: n(row.views) })),
      clients: (clients ?? []).map((row) => ({ client: s(row.client), views: n(row.views) })),
    }
  } catch (error) {
    return { days, sample: false, error: describe(error), eventLog: false, pages: [], referrers: [], countries: [], clients: [] }
  }
}

/* ---------------------------------------------------------------- AI agents */

export async function agents(days: Period): Promise<AgentsData> {
  const r = range(days)
  const sql = await database()
  if (!sql) return sample() ? sampleAgents(days) : { days, sample: false, error: missing, clients: [], pages: [], buckets: [] }
  try {
    const [clients, pages, series] = await Promise.all([
      sql`select client, sum(count)::int as reads, count(distinct item)::int as pages from usage_counts
          where kind = 'agent' and day >= ${r.start}::date group by client order by reads desc`,
      sql`select item as path, sum(count)::int as reads, count(distinct client)::int as clients from usage_counts
          where kind = 'agent' and day >= ${r.start}::date group by item order by reads desc limit 300`,
      sql`select day::text as day, sum(count)::int as agent from usage_counts where kind = 'agent' and day >= ${r.start}::date group by day`,
    ])
    const byDay = new Map<string, DayRow>()
    for (const row of series) byDay.set(s(row.day), { ...EMPTY, agent: n(row.agent) })
    return {
      days,
      sample: false,
      error: null,
      clients: clients.map((row) => ({ client: s(row.client), reads: n(row.reads), pages: n(row.pages), crawler: CRAWLERS.includes(s(row.client)) })),
      pages: pages.map((row) => ({ path: s(row.path), reads: n(row.reads), clients: n(row.clients) })),
      buckets: bucketsOf(days, r.current, byDay),
    }
  } catch (error) {
    return { days, sample: false, error: describe(error), clients: [], pages: [], buckets: [] }
  }
}

/* ---------------------------------------------------------------- the event log */

export async function recentEvents(): Promise<EventsData> {
  const sql = await database()
  if (!sql) return sample() ? sampleEvents() : { sample: false, error: missing, eventLog: false, rows: [] }
  try {
    const rows = await events(() => sql`select id::text, at::text, kind, item, client, visitor, country, referrer, detail from usage_events order by at desc limit 1000`)
    return {
      sample: false,
      error: null,
      eventLog: rows !== null,
      rows: (rows ?? []).map((row): EventRow => ({ id: s(row.id), at: s(row.at), kind: s(row.kind), item: s(row.item), client: s(row.client), visitor: row.visitor ? s(row.visitor) : null, country: row.country ? s(row.country) : null, referrer: row.referrer ? s(row.referrer) : null, detail: row.detail ? s(row.detail) : null })),
    }
  } catch (error) {
    return { sample: false, error: describe(error), eventLog: false, rows: [] }
  }
}

/** A database error, without the connection string or anything else secret. */
function describe(error: unknown): string {
  const text = error instanceof Error ? error.message : String(error)
  return text.replace(/postgres(ql)?:\/\/\S+/gi, "postgres://…").slice(0, 300)
}

/* ---------------------------------------------------------------- sample data (local development only) */

/** A repeatable random series, so the sample looks the same on every reload. */
function seeded(seed: number) {
  let x = seed
  return () => ((x = (x * 1103515245 + 12345) % 2147483648) / 2147483648)
}

function sampleDays(days: Period) {
  const r = range(days)
  const rand = seeded(days * 7919)
  const byDay = new Map<string, DayRow>()
  ;[...r.previous, ...r.current].forEach((day, i) => {
    const growth = 1 + i / (days * 2)
    const weekday = new Date(`${day}T00:00:00Z`).getUTCDay()
    const lift = weekday === 0 || weekday === 6 ? 0.7 : 1
    const visitors = Math.round((28 + rand() * 30) * growth * lift)
    byDay.set(day, {
      visitors,
      views: Math.round(visitors * (2.4 + rand())),
      installs: Math.round((6 + rand() * 9) * growth * lift),
      checks: Math.round(2 + rand() * 5),
      browser: Math.round(rand() * 4),
      bots: Math.round(3 + rand() * 8),
      agent: Math.round((30 + rand() * 40) * growth),
      copies: Math.round((4 + rand() * 7) * growth * lift),
    })
  })
  return { r, byDay }
}

function blankOverview(days: Period): OverviewData {
  return { days, sample: false, error: null, eventLog: false, eventsSince: null, buckets: [], totals: { current: { ...EMPTY }, previous: { ...EMPTY } }, funnel: { visits: 0, copied: 0, installed: 0 }, pages: [], referrers: [], countries: [], downloads: [] }
}

const SAMPLE_ITEMS = ["button", "tabs", "dialog", "data-table", "backroom", "segmented-control", "slider", "toast", "chart", "round", "accordion", "menu"]

function sampleOverview(days: Period): OverviewData {
  const { r, byDay } = sampleDays(days)
  const current = totalsOf(r.current, byDay)
  const scale = days / 30
  return {
    days,
    sample: true,
    error: null,
    eventLog: true,
    eventsSince: r.from,
    buckets: bucketsOf(days, r.current, byDay),
    totals: { current, previous: totalsOf(r.previous, byDay) },
    funnel: { visits: current.visitors, copied: Math.round(current.visitors * 0.12), installed: Math.round(current.visitors * 0.05) },
    pages: [["/", 0.34], ["/docs/components/tabs", 0.11], ["/docs/templates/backroom", 0.09], ["/docs/components/dialog", 0.07], ["/blog/shadcn-skill-vs-mcp", 0.06], ["/create", 0.05], ["/docs/installation", 0.04], ["/docs/components/data-table", 0.03]].map(([path, share]) => ({ path: String(path), views: Math.round(current.views * Number(share)), visitors: Math.round(current.visitors * Number(share) * 0.8) })),
    referrers: [["x.com", 0.4], ["google.com", 0.3], ["github.com", 0.1], ["awesome-ui-sdk.dev", 0.08], ["reddit.com", 0.05]].map(([host, share]) => ({ host: String(host), views: Math.round(current.views * 0.2 * Number(share)) })),
    countries: [["US", 0.28], ["IN", 0.22], ["DE", 0.09], ["GB", 0.08], ["FR", 0.05], ["BR", 0.04], ["CA", 0.04], ["NL", 0.03]].map(([code, share]) => ({ code: String(code), visitors: Math.round(current.visitors * Number(share)) })),
    downloads: SAMPLE_ITEMS.slice(0, 8).map((item, i) => ({ item, count: Math.round((60 - i * 6) * scale) })),
  }
}

function sampleInstalls(days: Period): InstallsData {
  const { r, byDay } = sampleDays(days)
  const scale = days / 30
  const rand = seeded(31)
  return {
    days,
    sample: true,
    error: null,
    rows: [...SAMPLE_ITEMS, "registry", "all"].map((item, i) => {
      const installs = item === "registry" ? 0 : Math.round((70 - i * 5) * scale * (0.6 + rand() * 0.5))
      const checks = item === "registry" ? Math.round(90 * scale) : Math.round(rand() * 4 * scale)
      const browser = item === "registry" ? 0 : Math.round(rand() * 6 * scale)
      const bots = Math.round(rand() * 8 * scale)
      return { item, installs, browser, checks, bots, total: installs + browser + checks + bots, last: r.end }
    }),
    buckets: bucketsOf(days, r.current, byDay),
    sweeps: { visitors: Math.round(3 * scale), files: Math.round(270 * scale) },
  }
}

function sampleTraffic(days: Period): TrafficData {
  const o = sampleOverview(days)
  return {
    days,
    sample: true,
    error: null,
    eventLog: true,
    pages: o.pages.map((p) => ({ ...p, last: new Date().toISOString() })),
    referrers: o.referrers.map((ref) => ({ ...ref, visitors: Math.round(ref.views * 0.8) })),
    countries: o.countries.map((c) => ({ ...c, views: c.visitors * 3 })),
    clients: [{ client: "browser", views: o.totals.current.views }],
  }
}

function sampleAgents(days: Period): AgentsData {
  const { r, byDay } = sampleDays(days)
  const total = totalsOf(r.current, byDay).agent
  const clients = [["ClaudeBot", 0.3], ["GPTBot", 0.22], ["Claude Code", 0.12], ["Google", 0.1], ["PerplexityBot", 0.08], ["Cursor", 0.06], ["cli", 0.05], ["OAI-SearchBot", 0.04]] as const
  return {
    days,
    sample: true,
    error: null,
    clients: clients.map(([client, share]) => ({ client, reads: Math.round(total * share), pages: Math.round(40 * share + 3), crawler: CRAWLERS.includes(client) })),
    pages: ["/llms.txt", "/llms-full.txt", "/index.md", "/docs/components/tabs.md", "/docs/installation.md", "/docs/templates/backroom.md"].map((path, i) => ({ path, reads: Math.round(total * (0.3 - i * 0.04)), clients: 6 - i })),
    buckets: bucketsOf(days, r.current, byDay),
  }
}

function sampleEvents(): EventsData {
  const rand = seeded(5)
  const kinds = ["view", "view", "view", "install", "agent", "copy"]
  const now = Date.now()
  return {
    sample: true,
    error: null,
    eventLog: true,
    rows: Array.from({ length: 140 }, (_, i): EventRow => {
      const kind = kinds[Math.floor(rand() * kinds.length)]
      const item = kind === "view" ? ["/", "/docs/components/tabs", "/docs/templates/backroom", "/create"][i % 4] : kind === "install" ? SAMPLE_ITEMS[i % SAMPLE_ITEMS.length] : kind === "agent" ? "/llms.txt" : "install_copy"
      const client = kind === "view" || kind === "copy" ? "browser" : kind === "install" ? "cli" : ["ClaudeBot", "GPTBot", "Claude Code"][i % 3]
      return { id: String(i), at: new Date(now - i * 9 * 60_000).toISOString(), kind, item, client, visitor: (Math.floor(rand() * 1e16)).toString(16).padStart(16, "0").slice(0, 16), country: ["US", "IN", "DE", "GB"][i % 4], referrer: i % 9 === 0 ? "x.com" : null, detail: kind === "copy" ? "/docs/components/tabs" : null }
    }),
  }
}
