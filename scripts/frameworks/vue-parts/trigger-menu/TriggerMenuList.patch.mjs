/* React: children ?? ((state) => <TriggerMenuItems items={state.items} />). */
import { withDefault } from "../_slots.mjs"
export default (src, { replace }) => {
  src = replace(src, `import { cn } from "@/lib/utils"`, `import { cn } from "@/lib/utils"\nimport TriggerMenuItems from "./TriggerMenuItems.vue"`)
  return withDefault(src, replace, `<TriggerMenuItems :items="scope?.state?.items" />`)
}
