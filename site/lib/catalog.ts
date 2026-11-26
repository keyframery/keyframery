import "server-only"

import catalog from "./catalog.generated.json"
import product from "../../content/product.json"

/* Everything the site knows about the components: names and groups from each demo's `meta`, descriptions
   from content/components.json, what moves from content/moves.json. scripts/build-catalog.mjs reads the
   source and writes catalog.generated.json before every build; importing it (rather than reading src/
   at run time) keeps the server function to the files it actually uses. */

export const MOVES: Record<string, string> = catalog.moves

/* `sdk` is the UI SDK component a Keyframery component wraps, or null when UI SDK has none.
   `core` is true for a component UI SDK doesn't ship, defined on its core with `definePrimitive`. */
export type Entry = { slug: string; name: string; group: string; description: string; sdk: string | null; core: boolean; moves: [string, string][] }

/* The order groups appear in, from the most used to the most specialised: the order of the categories in
   content/product.json, which the README's table uses too. */
export const groupOrder = Object.keys(product.categories)

export const entries = catalog.entries as Entry[]

export const groups = [...groupOrder, ...new Set(entries.map((e) => e.group).filter((g) => !groupOrder.includes(g)))]
  .map((group) => ({ group, items: entries.filter((e) => e.group === group) }))
  .filter((g) => g.items.length > 0)

export const entry = (slug: string) => entries.find((e) => e.slug === slug)
