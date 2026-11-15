import "server-only"

import fs from "node:fs"
import path from "node:path"

/* Everything the site knows about the components, read from the source at build time:
   names and groups from each demo's `meta`, descriptions from content/components.json,
   what moves from content/moves.json. */

const root = process.cwd()
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8")
const descriptions: Record<string, string> = JSON.parse(read("content/components.json"))
const motion: { moves: Record<string, string>; components: Record<string, [string, string][]> } = JSON.parse(read("content/moves.json"))

export const MOVES = motion.moves

/* `sdk` is the UI SDK component a Keyframery component wraps, or null when UI SDK has none. */
export type Entry = { slug: string; name: string; group: string; description: string; sdk: string | null; moves: [string, string][] }

/* Components built on a UI SDK part with a different name. */
const sdkPart: Record<string, string> = { "context-menu": "menu", "motion-style": "preferences" }

/* The order groups appear in, from the most used to the most specialised. */
export const groupOrder = ["Actions", "Forms", "Menus", "Overlays", "Navigation", "Disclosure", "Display", "Feedback", "Dates", "Layout", "Media", "Data", "Motion"]

function entryOf(slug: string): Entry {
  const meta = read(`src/demos/${slug}.tsx`).match(/export const meta = \{\s*name:\s*"([^"]+)",\s*group:\s*"([^"]+)"/)
  const primitive = `src/components/primitives/${slug}.tsx`
  const part = sdkPart[slug] ?? slug
  const code = fs.existsSync(path.join(root, primitive)) ? read(primitive) : ""
  const sdk = code.includes(`"@ui-sdk/react/${part}"`) || (part === "menu" && code.includes('"@/components/primitives/menu"')) ? part : null
  return { slug, name: meta?.[1] ?? slug, group: meta?.[2] ?? "Other", description: descriptions[slug] ?? "", sdk, moves: motion.components[slug] ?? [] }
}

export const entries: Entry[] = fs
  .readdirSync(path.join(root, "src/components/ui"))
  .map((f) => f.replace(/\.tsx$/, ""))
  .filter((slug) => fs.existsSync(path.join(root, "src/demos", `${slug}.tsx`)))
  .map(entryOf)
  .sort((a, b) => a.name.localeCompare(b.name))

export const groups = [...groupOrder, ...new Set(entries.map((e) => e.group).filter((g) => !groupOrder.includes(g)))]
  .map((group) => ({ group, items: entries.filter((e) => e.group === group) }))
  .filter((g) => g.items.length > 0)

export const entry = (slug: string) => entries.find((e) => e.slug === slug)
