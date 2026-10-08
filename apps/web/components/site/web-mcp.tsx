"use client"

/*
 * WebMCP (https://webmachinelearning.github.io/webmcp/): in a browser that supports it, an AI agent working in this
 * tab can call these tools instead of scraping the page. All three are read-only and stay on this site.
 * Nothing happens in browsers without the API.
 */

import * as React from "react"

import { agentPrompt } from "@/lib/kinds"
import { rankResults } from "./search-dialog"

type Tool = {
  name: string
  description: string
  inputSchema: object
  execute: (input: Record<string, unknown>) => Promise<unknown>
}
type ModelContext = { registerTool: (tool: Tool, options?: { signal?: AbortSignal }) => unknown }
type SearchResult = { id: string; url: string; type: "page" | "heading" | "text"; content: string }

const TOOLS: Tool[] = [
  {
    name: "search_docs",
    description: "Search Keyframery's docs (animations for shadcn/ui). Returns matching pages and sections with their paths.",
    inputSchema: { type: "object", properties: { query: { type: "string", description: "What to look for, e.g. 'animate a list'" } }, required: ["query"] },
    async execute({ query }) {
      const res = await fetch(`/api/search?query=${encodeURIComponent(String(query ?? ""))}`)
      const results = (await res.json()) as SearchResult[]
      return rankResults(results, String(query ?? "")).slice(0, 10).map(({ url, type, content }) => ({ path: url, type, text: content }))
    },
  },
  {
    name: "read_page",
    description: "Read a page of keyframery.com as Markdown, e.g. '/docs/installation' or '/docs/helpers/list-cut'.",
    inputSchema: { type: "object", properties: { path: { type: "string", description: "A path on this site, starting with /" } }, required: ["path"] },
    async execute({ path }) {
      const p = String(path ?? "")
      if (!p.startsWith("/") || p.startsWith("//")) return "Give a path on keyframery.com that starts with /, like /docs/installation."
      return (await fetch(p, { headers: { Accept: "text/markdown" } })).text()
    },
  },
  {
    name: "get_install_steps",
    description: "Step-by-step instructions to add Keyframery to a shadcn/ui project, written for a coding agent.",
    inputSchema: { type: "object", properties: {} },
    async execute() {
      return agentPrompt()
    },
  },
]

export function WebMcp() {
  React.useEffect(() => {
    // The spec puts the API on document; older Chrome builds put it on navigator.
    const context =
      (document as unknown as { modelContext?: ModelContext }).modelContext ?? (navigator as unknown as { modelContext?: ModelContext }).modelContext
    if (!context?.registerTool) return
    const controller = new AbortController()
    for (const tool of TOOLS) Promise.resolve(context.registerTool(tool, { signal: controller.signal })).catch(() => {})
    return () => controller.abort()
  }, [])
  return null
}
