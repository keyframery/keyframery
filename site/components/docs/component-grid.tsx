import { ComponentBrowser } from "@site/components/docs/component-browser"
import { entries, groups } from "@site/lib/catalog"

/** Every component, with a searchable index and categories from the actual catalog. */
export function ComponentGrid() {
  return <ComponentBrowser entries={entries} groups={groups.map(({ group }) => group)} />
}
