/* The parts a Stat renders when it is given no content. Like React (whose styled Stat leaves the
   children to the primitive), these carry the motion only, not the styled look, and the delta reads
   "+12%" / "−3.1%" instead of the styled arrow pill. */
import { defineComponent, h } from "vue"
import { usePart } from "@ui-sdk/vue/primitive"

import { stat } from "@/components/keyframery/core/stat-core"
import { partMotion } from "./parts"
import Roll from "./Roll.vue"

export const BareStatLabel = defineComponent({
  name: "StatLabel",
  setup: () => usePart(stat, "label", undefined, () => ({ class: partMotion }), { tag: "div", children: (state) => state.label }),
})

export const BareStatValue = defineComponent({
  name: "StatValue",
  setup: () => usePart(stat, "value", undefined, () => ({ class: partMotion }), { tag: "div", children: (state) => h(Roll, { text: state.text }) }),
})

export const BareStatDelta = defineComponent({
  name: "StatDelta",
  setup: () =>
    usePart(stat, "delta", undefined, () => ({ class: partMotion }), {
      tag: "div",
      children: (state) => [
        h("span", { class: "sr-only" }, state.words),
        h("span", { "aria-hidden": "true" }, state.trend === "up" ? "+" : state.trend === "down" ? "−" : ""),
        h("span", { "aria-hidden": "true" }, [h(Roll, { text: state.text })]),
      ],
    }),
})
