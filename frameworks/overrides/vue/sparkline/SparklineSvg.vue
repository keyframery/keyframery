<script lang="ts">
/* The SVG with the area's gradient, the area and the line. */
import { defineComponent, h, useId } from "vue"
import { type PartSlots, usePart } from "@ui-sdk/vue/primitive"

import { sparkline } from "@/components/keyframery/core/sparkline-core"
import { cn } from "@/lib/utils"
import { svgClass } from "./parts"
import SparklineArea from "./SparklineArea.vue"
import SparklineLine from "./SparklineLine.vue"

export default defineComponent({
  name: "SparklineSvg",
  inheritAttrs: false,
  slots: Object as PartSlots<typeof sparkline, "svg">,
  setup(_props, { attrs, slots }) {
    const id = (useId() ?? "kf").replace(/[^\w-]/g, "")
    return usePart(sparkline, "svg", undefined, () => ({ ...attrs, class: cn(svgClass, attrs.class as string) }), {
      tag: "svg",
      children: (state) =>
        slots.default
          ? slots.default({ state })
          : [
              h("defs", [
                h("linearGradient", { id: `${id}-fill`, x1: "0", y1: "0", x2: "0", y2: "1" }, [
                  h("stop", { offset: "0", style: { stopColor: "var(--sparkline-tone,currentColor)", stopOpacity: "var(--sparkline-fill-top,0.24)" } }),
                  h("stop", { offset: "1", style: { stopColor: "var(--sparkline-tone,currentColor)", stopOpacity: "var(--sparkline-fill-bottom,0)" } }),
                ]),
              ]),
              h(SparklineArea, { fill: `url(#${id}-fill)` }),
              h(SparklineLine),
            ],
    })
  },
})
</script>
