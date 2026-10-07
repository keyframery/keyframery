/* The Keyframery MCP server: four read-only tools over the same docs, search and theme code as the site.
   Mounted at /mcp by app/mcp/route.ts. */

import type { McpServer } from "@modelcontextprotocol/server"
import { z } from "zod"

import { kindsMarkdown } from "./kinds"
import { docsSearch } from "./search"
import { docsLlms, source } from "./source"
import { DEFAULTS, EASES, encode, EXIT_EASES, GROUPS, toCode, VARS, type Group, type ThemeSettings, type Var } from "./theme-url"

export const SITE = "https://keyframery.com"

export const INSTRUCTIONS =
  "Keyframery gives shadcn/ui apps film-style motion. One <Cuts /> in the root layout animates dialogs, sheets, drawers, tabs, toasts and menus; four helpers (MatchCut, ListCut, ValueCut, LoadCut) cover the changes shadcn has no component for. Call list_kinds before choosing a helper. Install with the shadcn CLI: npx shadcn add @keyframery/cuts. Use get_doc for exact APIs, search_docs when you don't know the page, and make_theme to tune speed and easing."

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
  const top = [...pages].slice(0, limit)
  if (!top.length) return reply(`No docs match "${query}". Try get_doc with path "index" for the overview, or list_kinds.`)
  return reply(top.map(([url, p], i) => `${i + 1}. ${p.title}: ${SITE}${url}${p.snippet ? `\n   ${p.snippet}` : ""}`).join("\n"))
}

const range = (v: "pace" | "travel" | "blur" | "depth" | "hold", what: string) =>
  z.number().min(VARS[v].min).max(VARS[v].max).optional().describe(`${what} (${VARS[v].min} to ${VARS[v].max}).`)
const keysOf = (o: Record<string, unknown>) => Object.keys(o) as [string, ...string[]]

const themeInput = z.object({
  pace: range("pace", "Duration multiplier for every cut; 1 is the default"),
  travel: range("travel", "How far a cut travels toward the element that opened it"),
  blur: range("blur", "Blur at the start of a rack focus, in px"),
  depth: range("depth", "The scale a dialog starts from"),
  hold: range("hold", "Milliseconds LoadCut waits before it shows a skeleton"),
  ease: z.enum(keysOf(EASES)).optional().describe("Entrance easing preset."),
  easeExit: z.enum(keysOf(EXIT_EASES)).optional().describe("Exit easing preset."),
  dialog: z.enum(GROUPS.dialog).optional().describe("The cut for dialogs, alert dialogs and the command menu."),
  sheet: z.enum(GROUPS.sheet).optional().describe("The cut for sheets."),
  drawer: z.enum(GROUPS.drawer).optional().describe("Whether the page steps back behind drawers."),
  tabs: z.enum(GROUPS.tabs).optional().describe("The cut for tabs."),
  toast: z.enum(GROUPS.toast).optional().describe("The cut for toasts."),
})

function makeTheme(input: z.infer<typeof themeInput>): Result {
  const s: ThemeSettings = { menus: { ...DEFAULTS.menus }, vars: { ...DEFAULTS.vars } }
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
    ].join("\n"),
  )
}

export function registerKeyframeryTools(server: McpServer): void {
  server.registerTool(
    "list_kinds",
    {
      title: "List the six kinds of change",
      description:
        "The six ways a screen can change and the Keyframery cut for each: whether it is automatic with <Cuts /> or needs a helper (MatchCut, ListCut, ValueCut, LoadCut), with install commands, usage snippets and docs links. Call this before choosing a helper.",
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
        path: z.string().trim().min(1).max(300).describe('A docs path such as "installation" or "helpers/list-cut", "index" for the overview, or a keyframery.com docs URL.'),
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
        "Builds the <Cuts /> line and the globals.css block for chosen speed, easing and cuts, plus a link that opens the same theme on the Theme page. Every input is optional; leave out what should stay at its default.",
      inputSchema: themeInput,
      annotations: READ_ONLY,
    },
    async (input) => makeTheme(input),
  )
}
