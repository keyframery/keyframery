/**
 * Counts registry GETs, Markdown reads and successful browser copy actions.
 * Each hit adds one to a row for (day, kind, item, client). Nothing that identifies a
 * person is kept: no IP address and no user agent string, only the kind of client it names (e.g. "cli", "ClaudeBot").
 *
 * Rows live in Neon when DATABASE_URL is set; without it, nothing is recorded. The table comes from db/usage.sql,
 * which is run by hand: the app never creates or changes tables itself.
 */

import type { CopyEventName } from "./copy-events"

// "install" is the historical database key for registry GET requests, not confirmed installations.
// Older rows may also have kind "mcp", from a server that has since been removed; nothing reads or writes them now.
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

const REGISTRY_ITEM = /^\/r\/([a-z0-9-]+)\.json$/
const SAFE_PATH = /^\/[A-Za-z0-9._~/-]{0,200}$/

/**
 * Which counter a request belongs to, or null for everything page analytics already covers. `markdown` is true
 * when the request asks for Markdown with `Accept` (see proxy.ts).
 */
export function classifyRequest(method: string, pathname: string, markdown: boolean): Omit<UsageHit, "client"> | null {
  if (method !== "GET") return null
  const item = REGISTRY_ITEM.exec(pathname)
  if (item) return { kind: "install", item: item[1] }
  if (!SAFE_PATH.test(pathname)) return null
  if (pathname === "/llms.txt" || pathname === "/llms-full.txt" || pathname.startsWith("/.well-known/")) return { kind: "agent", item: pathname }
  if (/\.mdx?$/.test(pathname)) return { kind: "agent", item: pathname.replace(/\.mdx$/, ".md") }
  if (markdown) return { kind: "agent", item: pathname === "/" ? "/index.md" : `${pathname}.md` }
  return null
}

/** Adds one to each hit's daily count. Never throws: counting must not break the response it rides on. */
export async function recordUsage(...hits: UsageHit[]): Promise<void> {
  const url = process.env.DATABASE_URL
  if (!url || hits.length === 0) return
  try {
    const { neon } = await import("@neondatabase/serverless")
    const sql = neon(url, { fetchOptions: { signal: AbortSignal.timeout(4000) } })
    for (const { kind, item, client } of hits) {
      await sql`insert into usage_counts (day, kind, item, client, count)
        values ((now() at time zone 'utc')::date, ${kind}, ${item}, ${client}, 1)
        on conflict (day, kind, item, client) do update set count = usage_counts.count + 1`
    }
  } catch (error) {
    console.warn("usage: not recorded:", error instanceof Error ? error.message : error)
  }
}
