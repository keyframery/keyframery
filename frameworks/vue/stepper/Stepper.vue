<script lang="ts">
/* The stepper. Put a StepperList (it renders every step from `steps` unless you give it items) and
   any StepperPanels inside. `value` + `@value-change` (or `v-model:value`) controls the current
   step. Written with usePrimitive + usePart, like the React primitive. */
import { defineComponent, type PropType } from "vue"
import type { ChangeDetails } from "@ui-sdk/core"
import { type PartSlots, usePart, usePrimitive } from "@ui-sdk/vue/primitive"

import { stepper, type StepperStep } from "@/components/keyframery/core/stepper-core"
import { type Speed, useSpeed } from "@/lib/keyframery"
import { cn } from "@/lib/utils"
import { stepperClass } from "./parts"

type ValueHandler = (value: string, details: ChangeDetails<"item-press" | "previous-press" | "next-press" | "imperative">) => void

export default defineComponent({
  name: "Stepper",
  inheritAttrs: false,
  props: {
    /** The steps, in order. */
    steps: { type: Array as PropType<readonly StepperStep[]>, default: undefined },
    /** The current step's value, controlled. */
    value: { type: String, default: undefined },
    /** The current step at first, when uncontrolled. Defaults to the first step. */
    defaultValue: { type: String, default: undefined },
    /** Runs when the current step wants to change. `details.cancel()` stays put. */
    onValueChange: { type: Function as PropType<ValueHandler>, default: undefined },
    "onUpdate:value": { type: Function as PropType<(value: string) => void>, default: undefined },
    /** The steps that are done. Defaults to every step before the furthest one reached. */
    completed: { type: Array as PropType<string[]>, default: undefined },
    /** Steps are buttons people can choose (the default). Off, a read-only progress strip. */
    interactive: { type: Boolean, default: undefined },
    /** Forward only through `next`; back to any step already reached (the default). */
    linear: { type: Boolean, default: undefined },
    /** "horizontal" (the default) or "vertical". */
    orientation: { type: String as PropType<"horizontal" | "vertical">, default: undefined },
    /** How fast the component moves: "fast", "normal", "slow" or a multiplier. */
    speed: { type: [String, Number] as PropType<Speed>, default: undefined },
  },
  slots: Object as PartSlots<typeof stepper, "root">,
  setup(props, { attrs }) {
    const handle = usePrimitive(stepper, () => {
      const change = props.onValueChange
      const update = props["onUpdate:value"]
      return {
        steps: props.steps,
        value: props.value,
        defaultValue: props.defaultValue,
        onValueChange:
          change || update
            ? (value: string, details: Parameters<ValueHandler>[1]) => {
                change?.(value, details)
                if (!details.canceled) update?.(value)
              }
            : undefined,
        completed: props.completed,
        interactive: props.interactive,
        linear: props.linear,
        orientation: props.orientation,
      }
    })
    const speedStyle = useSpeed(() => props.speed)
    return usePart(
      handle,
      "root",
      undefined,
      () => ({ ...attrs, class: cn(stepperClass, attrs.class as string), style: [speedStyle.value, attrs.style as any] }),
      "div",
    )
  },
})
</script>

<style>
/* kf-stepper: the keyframes this part animates with (React's <style href="kf-stepper">), shipped with the component. */
@keyframes kf-stepper-check{from{stroke-dashoffset:1}}
</style>
