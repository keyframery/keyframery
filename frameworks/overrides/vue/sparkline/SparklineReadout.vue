<script lang="ts">
/* The value under the pointer, above the plot. With no content it shows the point's label and its
   value, whose digits Roll. */
import { defineComponent, h } from "vue"
import { type PartSlots, usePart } from "@ui-sdk/vue/primitive"

import { sparkline } from "@/components/keyframery/core/sparkline-core"
import { cn } from "@/lib/utils"
import { readoutClass } from "./parts"
import Roll from "./Roll.vue"

export default defineComponent({
  name: "SparklineReadout",
  inheritAttrs: false,
  slots: Object as PartSlots<typeof sparkline, "readout">,
  setup(_props, { attrs, slots }) {
    return usePart(sparkline, "readout", undefined, () => ({ ...attrs, class: cn(readoutClass, attrs.class as string) }), {
      tag: "div",
      children: (state) =>
        slots.default ? slots.default({ state }) : [state.label ? h("span", { "data-readout-label": "" }, state.label) : null, h(Roll, { text: state.text })],
    })
  },
})
</script>
