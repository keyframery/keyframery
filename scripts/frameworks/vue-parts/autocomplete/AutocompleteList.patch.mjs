/* React: children ?? ((state) => <AutocompleteItems items={state.items} />). */
import { withDefault } from "../_slots.mjs"
export default (src, { replace }) => {
  src = replace(src, `import { cn } from "@/lib/utils"`, `import { cn } from "@/lib/utils"\nimport AutocompleteItems from "./AutocompleteItems.vue"`)
  return withDefault(src, replace, `<AutocompleteItems :items="scope?.state?.items" />`)
}
