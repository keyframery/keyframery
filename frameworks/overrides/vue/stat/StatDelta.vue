<script lang="ts">
/* The change: an arrow that turns to the direction, the direction in words for screen readers, and its size, which Rolls. */
import { defineComponent, h } from "vue"
import { type PartSlots, usePart } from "@ui-sdk/vue/primitive"

import { stat } from "@/components/keyframery/core/stat-core"
import { cn } from "@/lib/utils"
import { deltaClass } from "./parts"
import Roll from "./Roll.vue"
export default defineComponent({
  name: "StatDelta",
  inheritAttrs: false,
  slots: Object as PartSlots<typeof stat, "delta">,
  setup(_props, { attrs, slots }) {
    return usePart(stat, "delta", undefined, () => ({ ...attrs, class: cn(deltaClass, attrs.class as string) }), {
      tag: "div",
      children: (state) =>
        slots.default
          ? slots.default({ state })
          : [
              h("svg", { xmlns: "http://www.w3.org/2000/svg", width: 24, height: 24, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": 2, "stroke-linecap": "round", "stroke-linejoin": "round", class: "lucide lucide-arrow-up-right", "aria-hidden": "true" }, [
                h("path", { d: "M7 7h10v10" }),
                h("path", { d: "M7 17 17 7" }),
              ]),
              h("span", { class: "sr-only" }, state.words),
              h("span", { "aria-hidden": "true" }, [h(Roll, { text: state.text })]),
            ],
    })
  },
})
</script>
