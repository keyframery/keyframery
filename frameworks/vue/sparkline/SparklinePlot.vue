<script lang="ts">
/* The marks' box, inset by --sparkline-inset (default 4px) so the dots at the ends stay inside. With
   no content: the reference line, the cursor, the marks, the extremes, the marker, the last point and
   the readout. The points (the keyboard layer) are always added. */
import { defineComponent, h } from "vue"
import { type PartSlots, usePart } from "@ui-sdk/vue/primitive"

import { sparkline } from "@/components/keyframery/core/sparkline-core"
import { cn } from "@/lib/utils"
import { plotClass } from "./parts"
import SparklineBars from "./SparklineBars.vue"
import SparklineCursor from "./SparklineCursor.vue"
import SparklineEnd from "./SparklineEnd.vue"
import SparklineExtreme from "./SparklineExtreme.vue"
import SparklineMarker from "./SparklineMarker.vue"
import SparklinePoints from "./SparklinePoints.vue"
import SparklineReadout from "./SparklineReadout.vue"
import SparklineReference from "./SparklineReference.vue"
import SparklineSvg from "./SparklineSvg.vue"

export default defineComponent({
  name: "SparklinePlot",
  inheritAttrs: false,
  slots: Object as PartSlots<typeof sparkline, "plot">,
  setup(_props, { attrs, slots }) {
    return usePart(sparkline, "plot", undefined, () => ({ ...attrs, class: cn(plotClass, attrs.class as string) }), {
      tag: "div",
      children: (state) => [
        ...(slots.default
          ? slots.default({ state })
          : [
              h(SparklineReference),
              h(SparklineCursor),
              state.type === "bar" ? h(SparklineBars, { count: state.count }) : h(SparklineSvg),
              h(SparklineExtreme, { value: "max" }),
              h(SparklineExtreme, { value: "min" }),
              h(SparklineMarker),
              h(SparklineEnd),
              h(SparklineReadout),
            ]),
        h(SparklinePoints),
      ],
    })
  },
})
</script>
