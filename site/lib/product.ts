import product from "../../content/product.json"
import { entries } from "./catalog"

/* The one description of Keyframery (content/product.json), with its placeholders filled from the
   catalog, the same way scripts/stamp-copy.mjs fills them for the README. */
const list = (items: string[]) => (items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`)
const vars: Record<string, string> = {
  components: String(entries.length),
  ai: list(entries.filter((e) => e.group === "AI").map((e) => e.name)),
  frameworks: list(product.frameworks.filter((f) => f.status === "supported").map((f) => ("targets" in f && f.targets ? `${f.name} (${list(f.targets)})` : f.name))),
}

export const fill = (text: string) => text.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? `{${key}}`)

export { product }
export const highlights = product.highlights.map((h) => ({ title: fill(h.title), body: fill(h.body), href: h.href }))
