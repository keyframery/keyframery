<script setup lang="ts">
// Interactive legend and readout
// Compose the parts yourself to place them. `onActiveIndexChange` reports the point under the pointer or the arrow keys, and `hiddenSeries` with `onHiddenSeriesChange` lets the legend switch series off: they fold into the baseline while the others take their room.

import { computed, ref } from "vue"

import { Chart, type ChartConfig, ChartGrid, ChartLegend, ChartMarks, ChartPlot, ChartCursor, ChartTooltip, ChartXAxis, ChartYAxis, Roll } from "@/components/keyframery/chart"

const data = [
  { quarter: "Q1", coffee: 8200, pastries: 3100, beans: 1900 },
  { quarter: "Q2", coffee: 9400, pastries: 3600, beans: 2300 },
  { quarter: "Q3", coffee: 10100, pastries: 3300, beans: 2700 },
  { quarter: "Q4", coffee: 11800, pastries: 4200, beans: 3900 },
]
const config = {
  coffee: { label: "Coffee" },
  pastries: { label: "Pastries" },
  beans: { label: "Beans" },
} satisfies ChartConfig
type Key = keyof typeof config

const active = ref<number | null>(null)
const hidden = ref<string[]>([])
const shown = computed(() => (Object.keys(config) as Key[]).filter((key) => !hidden.value.includes(key)))
const rows = computed(() => active.value === null ? data : [data[active.value]])
const total = computed(() => rows.value.reduce((sum, row) => sum + shown.value.reduce((s, key) => s + row[key], 0), 0))
</script>

<template>
  <div class="w-full max-w-[520px]">
    <div class="mb-3 text-[13px] text-muted-foreground">{{ active === null ? 'Sales this year' : `Sales in ${data[active].quarter}` }}</div>
    <div class="mb-4 text-[28px] leading-none font-semibold tracking-tight">
      <Roll :text="`£${total.toLocaleString('en-GB')}`" />
    </div>
    <Chart
      v-model:hidden-series="hidden"
      aria-label="Café sales by quarter"
      type="bar"
      stacked
      :data="data"
      :config="config"
      category-key="quarter"
      :format-value="(n) => `£${n.toLocaleString('en-GB')}`"
      :format-tick="(n) => `£${n / 1000}k`"
      @active-index-change="(v) => (active = v)"
    >
      <ChartYAxis />
      <ChartPlot>
        <ChartGrid />
        <ChartCursor />
        <ChartMarks />
        <ChartTooltip indicator="line" />
      </ChartPlot>
      <ChartXAxis />
      <ChartLegend />
    </Chart>
  </div>
</template>
