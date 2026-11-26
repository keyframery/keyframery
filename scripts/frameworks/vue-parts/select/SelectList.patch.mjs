/* React: children ?? ((state) => <SelectItems items={state.items} />). */
import { withDefault } from "../_slots.mjs"
export default (src, { replace }) => {
  src = replace(src, `import { cn } from "@/lib/utils"`, `import { cn } from "@/lib/utils"\nimport SelectItems from "./SelectItems.vue"`)
  return withDefault(src, replace, `<SelectItems :items="scope?.state?.items" />`)
}
