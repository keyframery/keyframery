<script setup lang="ts">
/* Mirrors src/demos/sparkline.tsx with its default controls. */
import { computed, ref } from "vue"
import { percent, Sparkline } from "@/components/keyframery/sparkline"
import { SegmentedControl, SegmentedControlItem } from "@/components/keyframery/segmented-control"

function daily(seed: number, start: number, end: number) {
  return Array.from({ length: 60 }, (_, i) => {
    const t = i / 59
    const weekly = Math.sin((i + seed) * ((2 * Math.PI) / 7)) * 0.09
    const noise = Math.sin(i * 12.9898 + seed * 78.233) * 0.07
    return Math.max(1, Math.round((start + (end - start) * t * t) * (1 + weekly + noise)))
  })
}
const products = [
  { id: "overshirt", name: "Linen overshirt", kind: "Shirts", sales: daily(1, 22, 41) },
  { id: "crew", name: "Merino crew", kind: "Knitwear", sales: daily(3, 30, 37) },
  { id: "tote", name: "Canvas tote", kind: "Bags", sales: daily(5, 18, 18.4) },
  { id: "beanie", name: "Wool beanie", kind: "Accessories", sales: daily(2, 34, 19) },
]
const today = new Date(2026, 10, 19)
const dayLabel = (back: number) => {
  const d = new Date(today)
  d.setDate(d.getDate() - back)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}
const units = (n: number) => `${n.toLocaleString("en-US")} sold`
const span = ref("30")
const n = computed(() => Number(span.value))
const labels = computed(() => Array.from({ length: n.value }, (_, i) => dayLabel(n.value - 1 - i)))
const rows = computed(() =>
  products.map((p) => {
    const now = p.sales.slice(-n.value)
    const before = p.sales.slice(-2 * n.value, -n.value)
    const total = now.reduce((a, b) => a + b, 0)
    const prior = before.reduce((a, b) => a + b, 0)
    const change = (total - prior) / prior
    return { ...p, now, total, change, flat: Math.abs(change) < 0.01, up: change > 0 }
  }),
)
</script>

<template>
  <div data-demo="sparkline" class="@container w-full max-w-[560px]">
    <div
      style="--sparkline-height: 32px; --sparkline-stroke: 1.75px; --sparkline-dot: 6px"
      class="rounded-[18px] bg-background p-2 shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.04),0_12px_32px_-14px_rgb(0_0_0/0.14)] dark:bg-card dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07)]"
    >
      <div class="flex flex-wrap items-center justify-between gap-3 px-3 pt-2 pb-3">
        <div class="min-w-[9rem] flex-1">
          <div class="truncate text-[15px] font-semibold tracking-tight">Best sellers</div>
          <div class="mt-1 text-[12px] text-muted-foreground">Units sold per day</div>
        </div>
        <SegmentedControl aria-label="Period" :value="span" @value-change="(next: any) => next && (span = next)">
          <SegmentedControlItem value="7">7 days</SegmentedControlItem>
          <SegmentedControlItem value="30">30 days</SegmentedControlItem>
        </SegmentedControl>
      </div>
      <ul>
        <li
          v-for="p in rows"
          :key="p.id"
          :data-product="p.id"
          class="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 px-3 py-3 @[440px]:grid-cols-[minmax(0,1fr)_var(--w)_5.5rem] [&+li]:border-t [&+li]:border-[color:color-mix(in_oklch,var(--border)_70%,transparent)]"
          style="--w: 132px"
        >
          <div class="min-w-0">
            <div class="truncate text-[13px] leading-[1.3] font-medium">{{ p.name }}</div>
            <div class="mt-0.5 truncate text-[12px] leading-[1.3] text-muted-foreground">{{ p.kind }}</div>
          </div>
          <Sparkline
            class="col-span-2 row-start-2 @[440px]:col-span-1 @[440px]:row-start-auto"
            :data="p.now"
            :labels="labels"
            type="area"
            curve="smooth"
            trend-color
            :extremes="false"
            :reference="null"
            :label="`${p.name}, units sold per day`"
            :period="`last ${n} days`"
            :format-value="units"
          />
          <div class="text-right">
            <div class="text-[13px] leading-[1.3] font-medium tabular-nums">{{ p.total.toLocaleString("en-US") }}</div>
            <div
              :class="'mt-0.5 text-[12px] leading-[1.3] font-medium tabular-nums ' + (p.flat ? 'text-muted-foreground' : p.up ? 'text-[oklch(0.55_0.15_150)] dark:text-[oklch(0.74_0.16_150)]' : 'text-destructive')"
            >
              {{ p.flat ? "No change" : `${p.up ? "+" : "−"}${percent(p.change)}` }}
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>
