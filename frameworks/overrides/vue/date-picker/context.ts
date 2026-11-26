/* What the popup needs from the root: which way the months last turned, how many show, and the field
   box to line up with (React's PickerContext). */
import type { InjectionKey, Ref } from "vue"

export type PickerContext = {
  shown: { current: string | null }
  direction: Ref<"next" | "previous" | "none">
  months: Ref<number>
  field: Ref<HTMLElement | null>
}
export const pickerKey: InjectionKey<PickerContext> = Symbol("kf-date-picker")
