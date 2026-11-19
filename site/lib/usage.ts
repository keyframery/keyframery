/**
 * Counts registry downloads, Markdown reads and successful copy actions, and logs them (with page views) as events.
 * Each hit adds one to a row for (day, kind, item, client) in `usage_counts`, and appends a row to `usage_events`.
 * Nothing that identifies a person is kept: no IP address and no user agent string, only the kind of client it
 * names (e.g. "cli", "ClaudeBot") and, in the event log, a visitor code that changes every day (visitorCode).
 *
 * Rows go to Neon when DATABASE_URL is set; without it, nothing is recorded. usage_counts already exists (made by
 * hand for the old site); usage_events comes from db/analytics.sql, run by hand. This code only inserts rows and
 * never creates or changes tables.
 */

import type { CopyEventName } from "./copy-events"

// "install" is the historical database key for registry GET requests, not confirmed installations.
export type UsageKind = "install" | "agent" | CopyEventName
export type UsageHit = { kind: UsageKind; item: string; client: string }

/** Named clients, checked in order: crawlers and AI agents first, then coding tools that read the docs. */
const NAMED: [RegExp, string][] = [
  [/GPTBot/i, "GPTBot"],
  [/ChatGPT-User/i, "ChatGPT-User"],
  [/OAI-SearchBot/i, "OAI-SearchBot"],
  [/ClaudeBot/i, "ClaudeBot"],
  [/Claude-User/i, "Claude-User"],
  [/Claude-SearchBot/i, "Claude-SearchBot"],
  [/PerplexityBot/i, "PerplexityBot"],
  [/Perplexity-User/i, "Perplexity-User"],
  [/Googlebot|Google-Extended|GoogleOther|Google-InspectionTool/i, "Google"],
  [/bingbot/i, "Bing"],
  [/Applebot/i, "Applebot"],
  [/CCBot/i, "CCBot"],
  [/Bytespider/i, "Bytespider"],
  [/Amazonbot/i, "Amazonbot"],
  [/meta-externalagent|facebookexternalhit/i, "Meta"],
  [/DuckAssistBot|DuckDuckBot/i, "DuckDuckGo"],
  [/claude-code|claude-cli/i, "Claude Code"],
  [/Cursor\//i, "Cursor"],
  [/Windsurf|Codeium/i, "Windsurf"],
  [/VSCode|vscode/, "VS Code"],
]

const CRAWLERS = new Set(["GPTBot", "ChatGPT-User", "OAI-SearchBot", "ClaudeBot", "Claude-User", "Claude-SearchBot", "PerplexityBot", "Perplexity-User", "Google", "Bing", "Applebot", "CCBot", "Bytespider", "Amazonbot", "Meta", "DuckDuckGo", "other-bot"])
export const isCrawlerClient = (client: string): boolean => CRAWLERS.has(client)

/** The kind of client behind a user agent. The shadcn CLI downloads with Node's fetch, whose user agent is "node". */
export function classifyClient(userAgent: string | null): string {
  const ua = userAgent?.trim() ?? ""
  if (!ua) return "unknown"
  for (const [pattern, name] of NAMED) if (pattern.test(ua)) return name
  if (/bot|crawler|spider|scraper/i.test(ua)) return "other-bot"
  if (/^node$|^node\/|undici|node-fetch|^bun\/|^deno\//i.test(ua)) return "cli"
  if (/curl|wget|python|go-http|axios|httpie|okhttp|java\//i.test(ua)) return "script"
  if (/mozilla/i.test(ua)) return "browser"
  return "other"
}

/* Registry item names are lower-case, except preset codes, which are base62 (/r/preset-k2Bf9Q.json). */
const REGISTRY_ITEM = /^\/r\/([a-z0-9-]+|preset-[0-9A-Za-z]+)\.json$/
const SAFE_PATH = /^\/[A-Za-z0-9._~/-]{0,200}$/

/**
 * Which counter a request belongs to, or null for everything page analytics already covers. `markdown` is true
 * when proxy.ts answered the request with Markdown because its `Accept` header asked for it.
 */
export function classifyRequest(method: string, pathname: string, markdown: boolean): Omit<UsageHit, "client"> | null {
  if (method !== "GET") return null
  const item = REGISTRY_ITEM.exec(pathname)
  if (item) return { kind: "install", item: item[1] }
  if (!SAFE_PATH.test(pathname) || pathname.includes("..")) return null
  if (pathname === "/llms.txt" || pathname === "/llms-full.txt" || pathname.startsWith("/.well-known/")) return { kind: "agent", item: pathname }
  if (/\.mdx?$/.test(pathname)) return { kind: "agent", item: pathname.replace(/\.mdx$/, ".md") }
  if (markdown) return { kind: "agent", item: pathname === "/" ? "/index.md" : `${pathname}.md` }
  return null
}

/** A client for one batch of writes, given up on after 4 s so a slow database never holds a function open. */
async function database(url: string) {
  const { neon } = await import("@neondatabase/serverless")
  return neon(url, { fetchOptions: { signal: AbortSignal.timeout(4000) } })
}

/** Adds one to each hit's daily count. Never throws: counting must not break the response it rides on. */
export async function recordUsage(...hits: UsageHit[]): Promise<void> {
  const url = process.env.DATABASE_URL
  if (!url || hits.length === 0) return
  try {
    const sql = await database(url)
    for (const { kind, item, client } of hits) {
      await sql`insert into usage_counts (day, kind, item, client, count)
        values ((now() at time zone 'utc')::date, ${kind}, ${item}, ${client}, 1)
        on conflict (day, kind, item, client) do update set count = usage_counts.count + 1`
    }
  } catch (error) {
    console.warn("usage: not recorded:", error instanceof Error ? error.message : error)
  }
}

/* ---------------------------------------------------------------------------------------------------------------
   The event log (db/analytics.sql): one row per page view, registry GET, agent read or copy, so people can be told
   from bots and a visit linked to an install. Rows hold a daily visitor code, never the IP address or user agent. */

export type EventKind = "view" | "install" | "agent" | "copy"
export type UsageEvent = {
  kind: EventKind
  item: string
  client: string
  visitor: string | null
  country: string | null
  referrer?: string | null
  detail?: string | null
}

const sha256 = async (text: string): Promise<string> =>
  Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text))), (b) => b.toString(16).padStart(2, "0")).join("")

/** The UTC date, YYYY-MM-DD: the visitor code changes when it does. */
export const utcDay = (now: Date = new Date()): string => now.toISOString().slice(0, 10)

/**
 * A code that is the same for one IP address all of one UTC day and different on every other day, so a browser
 * visit and a CLI install from the same network can be linked on that day only. It is keyed with a secret
 * (a hash of DATABASE_URL), so nobody reading the table can test IP addresses against it. The user agent is left
 * out on purpose: a browser and the shadcn CLI on one machine have different ones. Null without an IP or a secret.
 */
export async function visitorCode(ip: string | null, day: string, secret: string | undefined): Promise<string | null> {
  if (!ip || !secret) return null
  return (await sha256(`kf:${await sha256(secret)}:${day}:${ip}`)).slice(0, 16)
}

/** What the event log takes from a request's headers. The IP is used only to make the visitor code, then dropped. */
export type RequestFacts = { ip: string | null; country: string | null; client: string }

export function requestFacts(headers: Headers): RequestFacts {
  const ip = headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip")?.trim() || null
  const country = headers.get("x-vercel-ip-country")?.trim().toUpperCase() ?? ""
  return {
    ip: ip && ip.length <= 64 ? ip : null,
    country: /^[A-Z]{2}$/.test(country) ? country : null,
    client: classifyClient(headers.get("user-agent")),
  }
}

/* Set once the table turns out not to exist (db/analytics.sql not run yet): this server instance stops trying,
   so a missing table costs one failed insert, not one per request. */
let eventLogMissing = false
const isMissingTable = (error: unknown): boolean => {
  const { code, message } = (error ?? {}) as { code?: unknown; message?: unknown }
  return code === "42P01" || (typeof message === "string" && /relation "?usage_events"? does not exist/i.test(message))
}

/** Appends each event to usage_events. Never throws, and stops for good once the table is known to be missing. */
export async function recordEvent(...events: UsageEvent[]): Promise<void> {
  const url = process.env.DATABASE_URL
  if (!url || eventLogMissing || events.length === 0) return
  try {
    const sql = await database(url)
    for (const { kind, item, client, visitor, country, referrer = null, detail = null } of events) {
      await sql`insert into usage_events (kind, item, client, visitor, country, referrer, detail)
        values (${kind}, ${item}, ${client}, ${visitor}, ${country}, ${referrer}, ${detail})`
    }
  } catch (error) {
    if (isMissingTable(error)) {
      eventLogMissing = true
      console.warn("usage: usage_events does not exist yet (run db/analytics.sql); the event log is off until the next deploy")
      return
    }
    console.warn("usage: event not recorded:", error instanceof Error ? error.message : error)
  }
}

/**
 * Records one hit in both stores: the daily counter (if any) and the event log, with the visitor code made from
 * the request's IP. Run it after the response (waitUntil / after). Never throws.
 */
export async function recordHit(counter: UsageHit | null, event: Omit<UsageEvent, "client" | "visitor" | "country">, facts: RequestFacts): Promise<void> {
  try {
    const secret = process.env.DATABASE_URL
    if (!secret) return
    const visitor = await visitorCode(facts.ip, utcDay(), secret)
    await Promise.all([counter ? recordUsage(counter) : undefined, recordEvent({ ...event, client: facts.client, visitor, country: facts.country })])
  } catch {
    // Counting must never break or slow what it rides on.
  }
}
