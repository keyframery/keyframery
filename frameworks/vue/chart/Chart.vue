<script setup lang="ts">
/* Styled chart: the animated primitive (./parts, the twin of src/components/primitives/chart.tsx) plus the
   Keyframery look (src/components/ui/chart.tsx). Quiet hairline rules, small muted labels, bars with soft
   corners, 2px lines over a fading wash, a light sheet for the tooltip and a row of toggles for the legend.

   Series colours come from the theme's chart tokens, --chart-1 … --chart-5, in config order, unless the
   config gives a colour; each is also set as --color-<key> on the chart.

   Theming: --chart-height (16rem), --chart-grid, --chart-axis, --chart-cursor, --chart-tooltip,
   --chart-radius, --chart-stroke (2px), --chart-dot (8px), --chart-bar-gap (4px).

   With no default slot it draws the legend (for more than one series or a ring), both axes and the plot.
   The slot receives `{ state }`. Events: active-index-change / update:activeIndex, hidden-series-change /
   update:hiddenSeries. */
import type { ChangeDetails } from "@ui-sdk/core"
import { computed, useAttrs } from "vue"

import type { ChartConfig, ChartCurve, ChartDatum, ChartOrientation, ChartType } from "@/components/keyframery/core/chart-core"
import { Speed, type Speed as SpeedValue } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

import ChartLegend from "./ChartLegend.vue"
import ChartPlot from "./ChartPlot.vue"
import ChartXAxis from "./ChartXAxis.vue"
import ChartYAxis from "./ChartYAxis.vue"
import { Chart as Primitive } from "./parts"

defineOptions({ inheritAttrs: false })
const props = withDefaults(
  defineProps<{
    data?: ChartDatum[]
    config?: ChartConfig
    categoryKey?: string
    type?: ChartType
    stacked?: boolean
    orientation?: ChartOrientation
    curve?: ChartCurve
    categoryGap?: number
    innerRadius?: number
    padAngle?: number
    dots?: boolean
    formatValue?: (value: number, series: string) => string
    formatTick?: (value: number) => string
    formatCategory?: (category: string, index: number) => string
    activeIndex?: number | null
    defaultActiveIndex?: number | null
    hiddenSeries?: string[]
    defaultHiddenSeries?: string[]
    speed?: SpeedValue
  }>(),
  { stacked: undefined, dots: undefined, activeIndex: undefined, defaultActiveIndex: undefined, speed: undefined },
)
const emit = defineEmits<{
  activeIndexChange: [index: number | null, details: ChangeDetails<string>]
  "update:activeIndex": [index: number | null]
  hiddenSeriesChange: [hidden: string[], details: ChangeDetails<string>]
  "update:hiddenSeries": [hidden: string[]]
}>()
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const options = computed(() => {
  const { speed: _speed, ...rest } = props
  return rest
})
const base = "h-[var(--chart-height,16rem)] w-full text-[12px] text-foreground"
</script>

<template>
  <Speed :speed="props.speed">
    <Primitive
      v-bind="{ ...options, ...forwarded }"
      :class="cn(base, attrs.class as any)"
      @active-index-change="(i: number | null, d: ChangeDetails<string>) => emit('activeIndexChange', i, d)"
      @update:active-index="(i: number | null) => emit('update:activeIndex', i)"
      @hidden-series-change="(h: string[], d: ChangeDetails<string>) => emit('hiddenSeriesChange', h, d)"
      @update:hidden-series="(h: string[]) => emit('update:hiddenSeries', h)"
    >
      <template #default="scope">
        <slot v-bind="scope ?? {}">
          <ChartLegend v-if="scope.state.radial || scope.state.series.length > 1" />
          <ChartYAxis />
          <ChartPlot />
          <ChartXAxis />
        </slot>
      </template>
    </Primitive>
  </Speed>
</template>

<style>
/* The donut's label rises in when it changes. */
@keyframes kf-chart-rise { from { opacity: 0; translate: 0 6px; filter: blur(3px) } }
</style>
