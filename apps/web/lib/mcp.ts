/* The Keyframery MCP server: four read-only tools over the same docs, search and theme code as the site.
   Mounted at /mcp by app/mcp/route.ts. */

import type { McpServer } from "@modelcontextprotocol/server"
import { z } from "zod"

import { INSTALL, KINDS, kindsMarkdown, REGISTER } from "./kinds"
import { docsSearch } from "./search"
import { docsLlms, source } from "./source"
import { DEFAULTS, EASES, encode, EXIT_EASES, GROUPS, PROFILES, serializeTheme, themeAgentPrompt, toCode, toInstall, VARS, type Group, type ThemeSettings, type Var } from "./theme-url"

export const SITE = "https://keyframery.com"

/** How the server introduces itself; the server card (/.well-known/mcp/server-card.json) says the same. */
export const SERVER_INFO = { name: "keyframery", version: "0.2.1" }

export const INSTRUCTIONS = `Keyframery gives shadcn/ui apps film-style motion. One <Cuts /> in the root layout animates dialogs, sheets, drawers, tabs, toasts and menus; five helpers (MatchCut, ListCut, ValueCut, LoadCut, StateCut) cover the changes shadcn has no component for. Call list_kinds before choosing a helper. Install with the shadcn CLI: ${INSTALL}. If it answers Unknown registry "@keyframery", register Keyframery once with ${REGISTER}, then install again. Use get_doc for exact APIs, search_docs when you don't know the page, and make_theme to start from a Quiet, Crisp or Expressive motion theme and tune speed, easing and cuts. All tools are read-only.`

const READ_ONLY = { readOnlyHint: true, openWorldHint: false }

type Result = { content: { type: "text"; text: string }[]; isError?: true }
const reply = (text: string): Result => ({ content: [{ type: "text", text }] })
const fail = (text: string): Result => ({ content: [{ type: "text", text }], isError: true })

/** "installation", "/docs/helpers/list-cut", "helpers/list-cut.mdx", "index" or a keyframery.com URL → page slugs. */
export function docSlugs(path: string): string[] {
  const p = path
    .trim()
    .replace(/^https?:\/\/[^/]+/i, "")
    .replace(/[?#].*$/, "")
    .replace(/\.mdx?$/, "")
    .replace(/^\/+|\/+$/g, "")
    .replace(/^docs(\/|$)/, "")
  return p === "" || p === "index" ? [] : p.split("/")
}

async function getDoc(path: string): Promise<Result> {
  const page = source.getPage(docSlugs(path))
  if (!page) {
    const valid = source.getPages().map((p) => p.slugs.join("/") || "index")
    return fail(`No docs page at "${path}". Valid paths: ${valid.join(", ")}.`)
  }
  return reply(await docsLlms.page(page))
}

const plain = (s: string) => s.replace(/<\/?mark>/g, "")

async function searchDocs(query: string, limit: number): Promise<Result> {
  const pages = new Map<string, { title: string; snippet?: string }>()
  for (const r of await docsSearch.search(query)) {
    const url = r.url.split("#")[0]
    const entry = pages.get(url) ?? { title: source.getPage(docSlugs(url))?.data.title ?? plain(r.content) }
    if (r.type !== "page" && !entry.snippet) entry.snippet = plain(r.content)
    pages.set(url, entry)
  }
  // Name matches first, as in the site's search: "ListCut" leads to the ListCut page, not to the many
  // component pages that mention it.
  const q = query.trim().toLowerCase()
  const helperOf = Object.fromEntries(KINDS.flatMap((k) => (k.helper ? [[`/docs/${k.docs}`, k.helper.toLowerCase()]] : [])))
  const tier = (url: string, title: string) =>
    Math.min(...[title.toLowerCase(), helperOf[url] ?? ""].filter(Boolean).map((n) => (n === q ? 0 : n.startsWith(q) ? 1 : n.includes(q) ? 2 : 3)))
  const top = [...pages]
    .map(([url, p], i) => ({ url, p, i, t: tier(url, p.title) }))
    .sort((a, b) => a.t - b.t || a.i - b.i)
    .map(({ url, p }) => [url, p] as const)
    .slice(0, limit)
  if (!top.length) return reply(`No docs match "${query}". Try get_doc with path "index" for the overview, or list_kinds.`)
  return reply(top.map(([url, p], i) => `${i + 1}. ${p.title}: ${SITE}${url}${p.snippet ? `\n   ${p.snippet}` : ""}`).join("\n"))
}

const range = (v: "pace" | "travel" | "blur" | "depth" | "hold", what: string) =>
  z.number().min(VARS[v].min).max(VARS[v].max).optional().describe(`${what} (${VARS[v].min} to ${VARS[v].max}).`)
const keysOf = (o: Record<string, unknown>) => Object.keys(o) as [string, ...string[]]

const themeInput = z.object({
  profile: z.enum(["quiet", "crisp", "expressive"]).optional().describe("A complete motion profile to start from. Explicit settings override this profile; otherwise start from Keyframery defaults."),
  pace: range("pace", "Duration multiplier for every cut; 1 is the default"),
  travel: range("travel", "How far a rack-focus dialog travels toward the element that opened it"),
  blur: range("blur", "Blur at the start of a rack focus, in px"),
  depth: range("depth", "The scale a rack-focus dialog starts from"),
  hold: range("hold", "Milliseconds LoadCut waits before it shows a skeleton"),
  ease: z.enum(keysOf(EASES)).optional().describe("Entrance easing preset."),
  easeExit: z.enum(keysOf(EXIT_EASES)).optional().describe("Exit easing preset."),
  dialog: z.enum(GROUPS.dialog).optional().describe("The cut for dialogs, alert dialogs and the command menu."),
  sheet: z.enum(GROUPS.sheet).optional().describe("The cut for sheets."),
  drawer: z.enum(GROUPS.drawer).optional().describe("Whether the page steps back behind drawers."),
  tabs: z.enum(GROUPS.tabs).optional().describe("The cut for tabs."),
  toast: z.enum(GROUPS.toast).optional().describe("The cut for toasts."),
}).strict()

function makeTheme(input: z.infer<typeof themeInput>): Result {
  const base = input.profile ? PROFILES[input.profile].settings : DEFAULTS
  const s: ThemeSettings = { menus: { ...base.menus }, vars: { ...base.vars } }
  for (const g of Object.keys(GROUPS) as Group[]) {
    const pick = input[g]
    if (pick) s.menus[g] = pick
  }
  for (const v of Object.keys(VARS) as Var[]) {
    const value = input[v]
    if (value !== undefined) s.vars[v] = value
  }
  const { jsx, css } = toCode(s)
  const query = encode(s)
  return reply(
    [
      "Render this once, in the root layout, in place of a plain <Cuts />:",
      "",
      "```tsx",
      jsx,
      "```",
      "",
      ...(css ? ["Add this to globals.css. It can also go on any section to scope it there:", "", "```css", css, "```"] : ["No CSS needed: everything else is at its default."]),
      "",
      `Open it in the Theme page: ${SITE}/theme${query ? `?${query}` : ""}`,
      "",
      "## Complete installation",
      toInstall(s),
      "",
      "## Reusable theme file",
      "```json",
      serializeTheme(s, input.profile ? PROFILES[input.profile].label : undefined),
      "```",
      "",
      "## Coding-agent handoff",
      themeAgentPrompt(s),
    ].join("\n"),
  )
}

export function registerKeyframeryTools(server: McpServer): void {
  server.registerTool(
    "list_kinds",
    {
      title: "List the seven kinds of change",
      description:
        "The seven kinds of change on a screen and the Keyframery cut for each: whether it is automatic with <Cuts /> or needs a helper (MatchCut, ListCut, ValueCut, LoadCut, StateCut), with install commands, usage snippets and docs links. Call this before choosing a helper.",
      annotations: READ_ONLY,
    },
    async () => reply(kindsMarkdown(SITE)),
  )
  server.registerTool(
    "search_docs",
    {
      title: "Search the Keyframery docs",
      description: "Search the Keyframery docs. Returns matching pages with their URLs and a short snippet. Follow up with get_doc.",
      inputSchema: z.object({
        query: z.string().trim().min(1).max(200).describe('What to look for, such as "ListCut" or "reduced motion".'),
        limit: z.number().int().min(1).max(10).optional().describe("How many pages to return; 5 by default."),
      }),
      annotations: READ_ONLY,
    },
    async ({ query, limit }) => searchDocs(query, limit ?? 5),
  )
  server.registerTool(
    "get_doc",
    {
      title: "Read a Keyframery docs page",
      description: "Returns one Keyframery docs page as Markdown, with its usage examples and prop tables.",
      inputSchema: z.object({
        path: z.string().trim().max(300).describe('A docs path such as "installation" or "helpers/list-cut", "index" or an empty string for the overview, or a keyframery.com docs URL.'),
      }),
      annotations: READ_ONLY,
    },
    async ({ path }) => getDoc(path),
  )
  server.registerTool(
    "make_theme",
    {
      title: "Make a Keyframery motion theme",
      description:
        "Starts from Quiet, Crisp, Expressive or the defaults, then applies explicit speed, easing and cut overrides. Returns the <Cuts /> line, CSS, preview link, complete installation instructions, versioned JSON and a coding-agent handoff. Every input is optional. Never edits the app.",
      inputSchema: themeInput,
      annotations: READ_ONLY,
    },
    async (input) => makeTheme(input),
  )
}
