<script lang="ts">
/* The sparkline. With no content it draws the plot with its marks, the last point and the readout.
   Name it with `label` and `period` (it reads "Revenue, last 14 days, up 12%"), or with your own
   `aria-label`. `trend-color` draws it in the colour of its news. Written with usePrimitive +
   usePart, like the React primitive. */
import { defineComponent, h, type PropType } from "vue"
import type { ChangeDetails } from "@ui-sdk/core"
import { type PartSlots, usePart, usePrimitive } from "@ui-sdk/vue/primitive"

import { sparkline, type SparklineCurve, type SparklineType, type SparklineValueFormatter } from "@/components/keyframery/core/sparkline-core"
import { type Speed, useSpeed } from "@/lib/keyframery"
import { cn } from "@/lib/utils"
import { sparklineClass } from "./parts"
import SparklinePlot from "./SparklinePlot.vue"

type ActiveHandler = (index: number | null, details: ChangeDetails<string>) => void

export default defineComponent({
  name: "Sparkline",
  inheritAttrs: false,
  props: {
    /** The numbers, oldest first. */
    data: { type: Array as PropType<number[]>, default: undefined },
    /** A name for each point, like "Nov 12", for the readout and the point names. */
    labels: { type: Array as PropType<string[]>, default: undefined },
    /** `line`, `area` or `bar`. */
    type: { type: String as PropType<SparklineType>, default: undefined },
    /** `smooth` (never overshooting a point) or `linear`. */
    curve: { type: String as PropType<SparklineCurve>, default: undefined },
    /** What it measures, like "Revenue". Starts the accessible summary. */
    label: { type: String, default: undefined },
    /** The span it covers, like "last 14 days". */
    period: { type: String, default: undefined },
    /** Formats a value for the readout and the point names. */
    formatValue: { type: Function as PropType<SparklineValueFormatter>, default: undefined },
    /** A fall is good news (refunds, churn, response time): the tone turns round. */
    downIsGood: { type: Boolean, default: undefined },
    /** A change smaller than this share of the first value counts as flat. */
    flatThreshold: { type: Number, default: undefined },
    /** A value to draw a dashed line at. */
    reference: { type: Number as PropType<number | null>, default: undefined },
    /** Marks the highest and the lowest point. */
    extremes: { type: Boolean, default: undefined },
    /** Keeps zero in the value range. */
    includeZero: { type: Boolean, default: undefined },
    /** The point (index) under the pointer or the keyboard, controlled. `null` for none. */
    activeIndex: { type: Number as PropType<number | null>, default: undefined },
    defaultActiveIndex: { type: Number as PropType<number | null>, default: undefined },
    onActiveIndexChange: { type: Function as PropType<ActiveHandler>, default: undefined },
    "onUpdate:activeIndex": { type: Function as PropType<(index: number | null) => void>, default: undefined },
    /** Draws in the colour of its news: green when good, red when bad, muted when flat. */
    trendColor: { type: Boolean, default: false },
    /** How fast the component moves: "fast", "normal", "slow" or a multiplier. */
    speed: { type: [String, Number] as PropType<Speed>, default: undefined },
  },
  slots: Object as PartSlots<typeof sparkline, "root">,
  setup(props, { attrs, slots }) {
    const handle = usePrimitive(sparkline, () => {
      const change = props.onActiveIndexChange
      const update = props["onUpdate:activeIndex"]
      return {
        data: props.data,
        labels: props.labels,
        type: props.type,
        curve: props.curve,
        label: props.label,
        period: props.period,
        formatValue: props.formatValue,
        downIsGood: props.downIsGood,
        flatThreshold: props.flatThreshold,
        reference: props.reference,
        extremes: props.extremes,
        includeZero: props.includeZero,
        activeIndex: props.activeIndex,
        defaultActiveIndex: props.defaultActiveIndex,
        onActiveIndexChange:
          change || update
            ? (index: number | null, details: ChangeDetails<any>) => {
                change?.(index, details)
                if (!details.canceled) update?.(index)
              }
            : undefined,
      }
    })
    const speedStyle = useSpeed(() => props.speed)
    return usePart(
      handle,
      "root",
      undefined,
      () => ({
        ...(props.trendColor ? { "data-trend-color": "" } : null),
        ...attrs,
        class: cn(sparklineClass, attrs.class as string),
        style: [speedStyle.value, attrs.style as any],
      }),
      { tag: "div", children: (state) => (slots.default ? slots.default({ state }) : h(SparklinePlot)) },
    )
  },
})
</script>
