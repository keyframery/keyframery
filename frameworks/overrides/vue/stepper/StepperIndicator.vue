<script lang="ts">
/* The number, or once finished a check that draws itself (a mark in error). With no content it
   renders them and lets `data-state` choose. Takes its item's `value` when given none. */
import { defineComponent, h, inject } from "vue"
import { type PartSlots, usePart } from "@ui-sdk/vue/primitive"

import { stepper } from "@/components/keyframery/core/stepper-core"
import { cn } from "@/lib/utils"
import { checkPathClass, indicatorClass, numberClass, numberGoneClass, itemValueKey } from "./parts"

export default defineComponent({
  name: "StepperIndicator",
  inheritAttrs: false,
  props: { value: { type: String, default: undefined } },
  slots: Object as PartSlots<typeof stepper, "indicator">,
  setup(props, { attrs, slots }) {
    const item = inject(itemValueKey, undefined)
    return usePart(
      stepper,
      "indicator",
      () => ({ value: props.value ?? (item?.() as string) }),
      () => ({ ...attrs, class: cn(indicatorClass, attrs.class as string) }),
      {
        tag: "span",
        children: (state) =>
          slots.default
            ? slots.default({ state })
            : [
                h("span", { class: cn(numberClass, state.state === "complete" || state.state === "error" ? numberGoneClass : "") }, state.index + 1),
                state.state === "complete"
                  ? h(
                      "svg",
                      { viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true", class: "size-3.5" },
                      [h("path", { d: "M3.5 8.5 6.5 11.5 12.5 4.75", pathLength: 1, class: checkPathClass })],
                    )
                  : null,
                state.state === "error"
                  ? h("svg", { viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "aria-hidden": "true", class: "size-3.5" }, [
                      h("path", { d: "M8 4.5v4.25" }),
                      h("path", { d: "M8 11.5h.01" }),
                    ])
                  : null,
              ],
      },
    )
  },
})
</script>
