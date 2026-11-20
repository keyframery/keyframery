/* The shapes /admin's pages pass from the server to the browser. No imports, so both sides can use them. */

export type Period = 7 | 30 | 90

/** One day, or one week when the period is 90 days. */
export type Bucket = {
  label: string
  from: string
  views: number
  visitors: number
  /** Registry downloads by the shadcn CLI and coding tools: installs. */
  installs: number
  /** Directory health checks and scripts. */
  checks: number
  /** Someone opening a registry file in a browser. */
  browser: number
  /** Crawlers fetching registry files. */
  bots: number
  /** Markdown reads by AI tools and crawlers. */
  agent: number
  /** Successful copy actions (install command, agent prompt, theme). */
  copies: number
}

export type Totals = Omit<Bucket, "label" | "from">

type Base = { sample: boolean; error: string | null }

export type OverviewData = Base & {
  days: Period
  /** Whether usage_events exists (db/analytics.sql has run). */
  eventLog: boolean
  eventsSince: string | null
  buckets: Bucket[]
  totals: { current: Totals; previous: Totals }
  funnel: { visits: number; copied: number; installed: number }
  pages: { path: string; views: number; visitors: number }[]
  referrers: { host: string; views: number }[]
  countries: { code: string; visitors: number }[]
  downloads: { item: string; count: number }[]
}

export type DownloadRow = { item: string; installs: number; browser: number; checks: number; bots: number; total: number; last: string }

export type InstallsData = Base & {
  days: Period
  rows: DownloadRow[]
  buckets: Bucket[]
  sweeps: { visitors: number; files: number } | null
}

export type TrafficData = Base & {
  days: Period
  eventLog: boolean
  pages: { path: string; views: number; visitors: number; last: string }[]
  referrers: { host: string; views: number; visitors: number }[]
  countries: { code: string; visitors: number; views: number }[]
  clients: { client: string; views: number }[]
}

export type AgentsData = Base & {
  days: Period
  clients: { client: string; reads: number; pages: number; crawler: boolean }[]
  pages: { path: string; reads: number; clients: number }[]
  buckets: Bucket[]
}

export type EventRow = { id: string; at: string; kind: string; item: string; client: string; visitor: string | null; country: string | null; referrer: string | null; detail: string | null }

export type EventsData = Base & { eventLog: boolean; rows: EventRow[] }
