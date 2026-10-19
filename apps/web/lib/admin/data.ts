import { SERVER_INFO } from "@/lib/mcp"
import { summarizeUsage, type Usage, type UsageCount } from "./usage-summary"

/**
 * Everything /admin shows, each from its own source. A source that isn't configured or fails says so on its own
 * card; it never takes the page down. Secrets stay on the server: the browser only ever receives the numbers.
 */

export type Source<T> = { ok: true; data: T } | { ok: false; reason: string }
export type Row = { label: string; count: number; extra?: number }

const REPO = "keyframery/keyframery"
const TIMEOUT = 8000

async function getJson<T>(url: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(url, { ...init, cache: "no-store", signal: AbortSignal.timeout(TIMEOUT) })
  if (!response.ok) throw new Error(`${new URL(url).host} answered ${response.status}`)
  return response.json() as Promise<T>
}

const failed = (error: unknown): { ok: false; reason: string } => ({ ok: false, reason: error instanceof Error ? error.message : String(error) })

function top(map: Map<string, number>, limit = 20): Row[] {
  return [...map].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count).slice(0, limit)
}

function add(map: Map<string, number>, key: string, count: number) {
  map.set(key, (map.get(key) ?? 0) + count)
}

/* Aggregate registry GETs, copy actions, MCP calls and agent reads (lib/usage.ts). */

export async function usage(days: number): Promise<Source<Usage>> {
  const url = process.env.DATABASE_URL
  if (!url) return { ok: false, reason: "DATABASE_URL isn't set." }
  try {
    const { neon } = await import("@neondatabase/serverless")
    const sql = neon(url, { fetchOptions: { signal: AbortSignal.timeout(TIMEOUT) } })
    const rows = (await sql`select day::text as day, kind, item, client, count from usage_counts
      where day > (now() at time zone 'utc')::date - ${days}::int`) as UsageCount[]
    const all = (await sql`select kind, sum(count)::int as count from usage_counts group by kind`) as { kind: keyof Usage["totals"]; count: number }[]

    return { ok: true, data: summarizeUsage(rows, all) }
  } catch (error) {
    if (error instanceof Error && /usage_counts.*does not exist/i.test(error.message)) {
      return { ok: false, reason: "The usage_counts table doesn't exist yet: run apps/web/db/usage.sql once in Neon." }
    }
    return failed(error)
  }
}

/* Site traffic: Cloudflare Web Analytics (page views from the beacon; bots and installs don't run it) */

export type Traffic = { views: number; visits: number; byDay: Row[]; pages: Row[]; referrers: Row[]; countries: Row[]; devices: Row[]; browsers: Row[] }

type RumGroup = { count: number; sum: { visits: number }; dimensions: Record<string, string> }

export async function traffic(days: number): Promise<Source<Traffic>> {
  const token = process.env.CF_API_TOKEN
  const account = process.env.CF_ACCOUNT_ID
  if (!token || !account) return { ok: false, reason: "CF_API_TOKEN and CF_ACCOUNT_ID aren't set." }
  const until = new Date()
  const since = new Date(until.getTime() - days * 86_400_000)
  const filter = `{ datetime_geq: "${since.toISOString()}", datetime_leq: "${until.toISOString()}" }`
  const group = (alias: string, dimension: string) =>
    `${alias}: rumPageloadEventsAdaptiveGroups(limit: 1000, filter: ${filter}, orderBy: [count_DESC]) { count sum { visits } dimensions { ${dimension} } }`
  const query = `query ($account: String!) {
    viewer { accounts(filter: { accountTag: $account }) {
      ${group("byDay", "date")} ${group("pages", "requestPath")} ${group("referrers", "refererHost")}
      ${group("countries", "countryName")} ${group("devices", "deviceType")} ${group("browsers", "userAgentBrowser")}
    } } }`
  try {
    const body = await getJson<{ data?: { viewer: { accounts: Record<string, RumGroup[]>[] } }; errors?: { message: string }[] }>(
      "https://api.cloudflare.com/client/v4/graphql",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ query, variables: { account } }),
      },
    )
    if (body.errors?.length) throw new Error(body.errors[0].message)
    const groups = body.data?.viewer.accounts[0]
    if (!groups) throw new Error("Cloudflare returned no account data")
    // keyframery.com reports to two site tags (our snippet and Cloudflare's automatic one); grouping by the
    // dimension alone sums them.
    const rows = (name: string, dimension: string, limit = 20, empty = "(direct)") => {
      const map = new Map<string, number>()
      for (const g of groups[name]) add(map, g.dimensions[dimension] || empty, g.count)
      return top(map, limit)
    }
    const byDay = new Map<string, { views: number; visits: number }>()
    for (const g of groups.byDay) {
      const day = byDay.get(g.dimensions.date) ?? { views: 0, visits: 0 }
      day.views += g.count
      day.visits += g.sum.visits
      byDay.set(g.dimensions.date, day)
    }
    return {
      ok: true,
      data: {
        views: groups.byDay.reduce((n, g) => n + g.count, 0),
        visits: groups.byDay.reduce((n, g) => n + g.sum.visits, 0),
        byDay: [...byDay].map(([label, d]) => ({ label, count: d.visits, extra: d.views })).sort((a, b) => b.label.localeCompare(a.label)),
        pages: rows("pages", "requestPath", 25),
        referrers: rows("referrers", "refererHost").filter((r) => r.label !== "keyframery.com"),
        countries: rows("countries", "countryName"),
        devices: rows("devices", "deviceType"),
        browsers: rows("browsers", "userAgentBrowser", 10),
      },
    }
  } catch (error) {
    return failed(error)
  }
}

/* GitHub: public numbers always; traffic (14 days) needs a token with read access to the repo's administration */

export type GitHub = {
  stars: number
  forks: number
  watchers: number
  issues: number
  pushed: string
  traffic: null | { views: number; uniqueViews: number; clones: number; uniqueClones: number; referrers: Row[]; paths: Row[] }
}

export async function github(): Promise<Source<GitHub>> {
  const token = process.env.GITHUB_TOKEN
  const headers: Record<string, string> = { Accept: "application/vnd.github+json", "User-Agent": "keyframery-admin" }
  if (token) headers.Authorization = `Bearer ${token}`
  try {
    const repo = await getJson<{ stargazers_count: number; forks_count: number; subscribers_count: number; open_issues_count: number; pushed_at: string }>(
      `https://api.github.com/repos/${REPO}`,
      { headers },
    )
    let traffic: GitHub["traffic"] = null
    if (token) {
      const base = `https://api.github.com/repos/${REPO}/traffic`
      const [views, clones, referrers, paths] = await Promise.all([
        getJson<{ count: number; uniques: number }>(`${base}/views`, { headers }),
        getJson<{ count: number; uniques: number }>(`${base}/clones`, { headers }),
        getJson<{ referrer: string; count: number; uniques: number }[]>(`${base}/popular/referrers`, { headers }),
        getJson<{ path: string; count: number; uniques: number }[]>(`${base}/popular/paths`, { headers }),
      ])
      traffic = {
        views: views.count,
        uniqueViews: views.uniques,
        clones: clones.count,
        uniqueClones: clones.uniques,
        referrers: referrers.map((r) => ({ label: r.referrer, count: r.count, extra: r.uniques })),
        paths: paths.map((p) => ({ label: p.path, count: p.count, extra: p.uniques })),
      }
    }
    return {
      ok: true,
      data: { stars: repo.stargazers_count, forks: repo.forks_count, watchers: repo.subscribers_count, issues: repo.open_issues_count, pushed: repo.pushed_at, traffic },
    }
  } catch (error) {
    return failed(error)
  }
}

/* Where agents and the shadcn CLI find us */

export type Distribution = {
  skills: { ours: Row[]; topMatch: Row | null }
  registryIndex: { listed: boolean; url: string | null }
  mcpVersion: string
}

export async function distribution(): Promise<Source<Distribution>> {
  try {
    const [skills, index] = await Promise.allSettled([
      getJson<{ skills: { id: string; source: string; name: string; installs: number }[] }>("https://skills.sh/api/search?q=keyframery"),
      getJson<unknown>("https://ui.shadcn.com/r/registries.json"),
    ])
    const found = skills.status === "fulfilled" ? skills.value.skills : []
    const entry = index.status === "fulfilled" ? findRegistry(index.value) : null
    return {
      ok: true,
      data: {
        skills: {
          ours: found.filter((s) => s.source.startsWith("keyframery/")).map((s) => ({ label: s.name, count: s.installs })),
          topMatch: found[0] ? { label: `${found[0].source} · ${found[0].name}`, count: found[0].installs } : null,
        },
        registryIndex: { listed: Boolean(entry), url: entry },
        mcpVersion: SERVER_INFO.version,
      },
    }
  } catch (error) {
    return failed(error)
  }
}

/** shadcn's registry index has been both a list of entries and a name → URL map; accept either. */
function findRegistry(index: unknown): string | null {
  if (Array.isArray(index)) {
    const entry = index.find((e) => e && typeof e === "object" && (e as { name?: string }).name === "@keyframery") as { url?: string } | undefined
    return entry ? (entry.url ?? "") : null
  }
  if (index && typeof index === "object") {
    const value = (index as Record<string, unknown>)["@keyframery"]
    if (typeof value === "string") return value
    if (value && typeof value === "object") return (value as { url?: string }).url ?? ""
  }
  return null
}

/** Which settings are present (names only, never values), for the setup card. */
export function setup() {
  const has = (name: string) => Boolean(process.env[name])
  return [
    { name: "KEYFRAMERY_ADMIN_PASSWORD", set: has("KEYFRAMERY_ADMIN_PASSWORD"), use: "this page's password (24+ characters)" },
    { name: "DATABASE_URL", set: has("DATABASE_URL"), use: "registry GETs, successful copies, MCP calls and agent reads (Neon)" },
    { name: "CF_API_TOKEN", set: has("CF_API_TOKEN"), use: "site traffic (Cloudflare Web Analytics, Account Analytics: Read)" },
    { name: "CF_ACCOUNT_ID", set: has("CF_ACCOUNT_ID"), use: "site traffic (Cloudflare account)" },
    { name: "GITHUB_TOKEN", set: has("GITHUB_TOKEN"), use: "GitHub traffic (optional; stars work without it)" },
  ]
}
