<script setup lang="ts">
/* Mirrors src/demos/chart.tsx. Its default controls, or the lab's ?controls=type:line,series:3,… (type, series,
   stacked, orientation, curve, dots), so other chart types can be compared too. */
import { computed, ref } from "vue"

import {
  Chart,
  ChartCenter,
  type ChartConfig,
  ChartCursor,
  ChartGrid,
  ChartLegend,
  ChartMarks,
  ChartPlot,
  ChartTooltip,
  ChartXAxis,
  ChartYAxis,
  Roll,
} from "@/components/keyframery/chart"

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
const online = [18400, 21200, 19800, 24600, 27300, 26100, 29800, 31400, 28900, 33700, 38200, 44600]
const store = [12100, 11600, 13900, 14200, 15800, 17400, 16900, 15200, 16700, 18300, 21900, 27400]
const wholesale = [6200, 7400, 6900, 8100, 7600, 9300, 8800, 9900, 10400, 9700, 11200, 12800]
const year = months.map((month, i) => ({ month, online: online[i], store: store[i], wholesale: wholesale[i] }))
const channels = [
  { key: "online", label: "Online" },
  { key: "store", label: "In store" },
  { key: "wholesale", label: "Wholesale" },
] as const
const q = Object.fromEntries(
  (new URLSearchParams(location.search).get("controls") ?? "").split(",").filter((p) => p.includes(":")).map((p) => [p.slice(0, p.indexOf(":")), decodeURIComponent(p.slice(p.indexOf(":") + 1))]),
)
type ChartKind = "bar" | "line" | "area" | "donut" | "pie"
const type = (q.type ?? "bar") as ChartKind
const series = Number(q.series ?? 2)
const stacked = q.stacked === "true"
const orientation = (q.orientation ?? "vertical") as "vertical" | "horizontal"
const curve = (q.curve ?? "smooth") as "smooth" | "linear"
const dots = q.dots === "true"
const radial = type === "donut" || type === "pie"
const shown = channels.slice(0, series)

const money = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`
const thousands = (n: number) => (n === 0 ? "$0" : `$${n / 1000}k`)
const short = (month: string) => month.slice(0, 3)

const title = "Net revenue"
const config: ChartConfig = radial
  ? { channel: { label: "Channel" }, revenue: { label: "Revenue" }, ...Object.fromEntries(shown.map((c) => [c.key, { label: c.label }])) }
  : { month: { label: "Month" }, ...Object.fromEntries(shown.map((c) => [c.key, { label: c.label }])) }
const across = type === "bar" && orientation === "horizontal"
const rows = across ? year.slice(6) : year
const range = across ? "July – December 2026" : "January – December 2026"
const shortRange = across ? "Jul – Dec 2026" : "Jan – Dec 2026"
const data = radial ? shown.map((c) => ({ channel: c.key, revenue: year.reduce((sum, row) => sum + row[c.key], 0) })) : rows

const active = ref<number | null>(null)
const hidden = ref<string[]>([])
const visible = computed(() => shown.filter((c) => !hidden.value.includes(c.key)))
const sumOf = (row: (typeof year)[number]) => visible.value.reduce((sum, c) => sum + row[c.key], 0)
const at = computed(() => (active.value === null ? null : radial ? null : rows[active.value]))
const value = computed(() =>
  radial
    ? active.value === null
      ? shown.filter((c) => !hidden.value.includes(c.key)).reduce((sum, c) => sum + year.reduce((s, row) => s + row[c.key], 0), 0)
      : ((data[active.value] as { revenue: number } | undefined)?.revenue ?? 0)
    : at.value
      ? sumOf(at.value)
      : rows.reduce((sum, row) => sum + sumOf(row), 0),
)
const caption = computed(() => (radial ? (active.value === null ? range : `${shown[active.value]?.label ?? ""}, 2026`) : at.value ? `${at.value.month} 2026` : range))
</script>

<template>
  <div class="@container w-full max-w-[640px]">
    <div
      style="--chart-height: 260px; --chart-radius: 4px; --chart-bar-gap: 4px; --chart-stroke: 2px; --chart-dot: 8px"
      class="rounded-[18px] bg-background p-4 shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.04),0_12px_32px_-14px_rgb(0_0_0/0.14)] @[480px]:px-6 @[480px]:pt-5 @[480px]:pb-5 dark:bg-card dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07)]"
    >
      <div class="mb-4">
        <div class="flex items-baseline justify-between gap-3 text-[13px]">
          <div class="truncate font-medium text-muted-foreground">{{ title }}</div>
          <div
            :key="caption"
            class="shrink-0 animate-[kf-chart-rise_calc(360ms*var(--kf-speed,1))_var(--ease-spring)_backwards] text-[12px] text-muted-foreground tabular-nums motion-reduce:animate-none"
          >
            <template v-if="caption === range">
              <span class="@[480px]:hidden">{{ shortRange }}</span>
              <span class="hidden @[480px]:inline">{{ range }}</span>
            </template>
            <template v-else>{{ caption }}</template>
          </div>
        </div>
        <div class="mt-2 text-[26px] leading-none font-semibold tracking-tight tabular-nums @[480px]:text-[30px]">
          <Roll :text="money(value)" />
        </div>
      </div>
      <Chart
        :aria-label="`${title}, 2026`"
        :type="type"
        :data="data"
        :config="config"
        :category-key="radial ? 'channel' : 'month'"
        :stacked="stacked"
        :orientation="orientation"
        :curve="curve"
        :dots="dots"
        :format-value="money"
        :format-tick="thousands"
        :format-category="short"
        :hidden-series="hidden"
        @active-index-change="(i: number | null) => (active = i)"
        @hidden-series-change="(h: string[]) => (hidden = h)"
      >
        <ChartLegend side="top" class="justify-start pb-4 -ml-2" />
        <ChartYAxis />
        <ChartPlot>
          <ChartGrid />
          <ChartCursor />
          <ChartMarks />
          <ChartCenter />
          <ChartTooltip />
        </ChartPlot>
        <ChartXAxis />
      </Chart>
    </div>
  </div>
</template>
