import { KINDS } from "@/lib/kinds"

type Result = { id: string; url: string; type: "page" | "heading" | "text"; content: string }

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" }

/** Search snippets are Markdown: drop the highlight tags and backticks, and decode entities. */
export const plain = (text: string) =>
  text
    .replace(/<\/?mark>/g, "")
    .replace(/`/g, "")
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&(amp|lt|gt|quot|apos);/g, (_, n) => ENTITIES[n])

/** A snippet that is only a JSX component's source (a demo or an API table) means nothing in a result list. */
const isMarkup = (r: Result) => r.type !== "page" && /^\s*<[A-Z]/.test(plain(r.content))

/** The component behind each "Animate your app" page, so a search for "ListCut" finds the page titled "Lists". */
export const COMPONENT_OF: Record<string, string> = Object.fromEntries(KINDS.flatMap((k) => (k.helper ? [[`/docs/${k.docs}`, k.helper]] : [])))

/**
 * Keeps each page's results together and puts the page named after the query first, because people type
 * component names: an exact title or component name, then one that starts with it, then one that contains
 * it, then the rest.
 */
export function rankResults(results: Result[], query: string): Result[] {
  const groups: Result[][] = []
  for (const r of results) {
    if (isMarkup(r)) continue
    if (r.type === "page" || groups.length === 0) groups.push([r])
    else groups[groups.length - 1].push(r)
  }
  const q = query.trim().toLowerCase()
  const tierOf = (name: string) => (name === q ? 0 : name.startsWith(q) ? 1 : name.includes(q) ? 2 : 3)
  const tier = (g: Result[]) => {
    if (g[0].type !== "page") return 3
    const names = [plain(g[0].content), COMPONENT_OF[g[0].url] ?? ""].filter(Boolean)
    return Math.min(...names.map((n) => tierOf(n.toLowerCase())))
  }
  return groups
    .map((g, i) => ({ g, i, t: tier(g) }))
    .sort((a, b) => a.t - b.t || a.i - b.i)
    .flatMap((x) => x.g)
}
