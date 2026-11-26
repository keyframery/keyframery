/* React: children ?? ((state) => <ComboboxItems items={state.items} />). */
import { withDefault } from "../_slots.mjs"
export default (src, { replace }) => {
  src = replace(src, `import { cn } from "@/lib/utils"`, `import { cn } from "@/lib/utils"\nimport ComboboxItems from "./ComboboxItems.vue"`)
  return withDefault(src, replace, `<ComboboxItems :items="scope?.state?.items" />`)
}
