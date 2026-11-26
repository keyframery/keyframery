<script lang="ts">
/* The keyboard and screen reader layer: one tab stop, arrow keys between points. */
import { defineComponent, h } from "vue"
import { type PartSlots, usePart } from "@ui-sdk/vue/primitive"

import { sparkline } from "@/components/keyframery/core/sparkline-core"
import { cn } from "@/lib/utils"
import { pointsClass } from "./parts"
import SparklinePoint from "./SparklinePoint.vue"

export default defineComponent({
  name: "SparklinePoints",
  inheritAttrs: false,
  slots: Object as PartSlots<typeof sparkline, "points">,
  setup(_props, { attrs }) {
    return usePart(sparkline, "points", undefined, () => ({ ...attrs, class: cn(pointsClass, attrs.class as string) }), {
      tag: "div",
      children: (state) => state.keys.map((key) => h(SparklinePoint, { key, value: key })),
    })
  },
})
</script>
