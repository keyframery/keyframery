<script setup lang="ts">
/* Mirrors src/demos/stat.tsx with its default controls. Icons: lucide's paths inlined. */
import { computed, ref } from "vue"
import { Stat, StatChart, StatComparison, StatDelta, StatGroup, StatIcon, StatLabel, StatValue } from "@/components/keyframery/stat"
import { Sparkline } from "@/components/keyframery/sparkline"
import { SegmentedControl, SegmentedControlItem } from "@/components/keyframery/segmented-control"

const DAYS = 180
const wave = (i: number, seed: number) => Math.sin((i + seed) * ((2 * Math.PI) / 7)) * 0.08 + Math.sin(i * 12.9898 + seed * 78.233) * 0.05
const history = Array.from({ length: DAYS }, (_, i) => {
  const back = DAYS - 1 - i
  const soft = back < 7 ? 0.82 : 1
  const orders = Math.round((38 + i * 0.16) * (1 + wave(i, 2)) * soft)
  const basket = (61 + i * 0.035) * (1 + wave(i, 5) * 0.4) * (back < 7 ? 1.07 : 1)
  const revenue = Math.round(orders * basket)
  const rate = Math.max(0.6, 2.9 - i * 0.006 + wave(i, 3) * 2 + (back < 4 ? 1.1 : 0)) / 100
  return { orders, revenue, refunds: orders * rate }
})
function totals(from: number, to: number) {
  const rows = history.slice(from, to)
  const revenue = rows.reduce((s, r) => s + r.revenue, 0)
  const orders = rows.reduce((s, r) => s + r.orders, 0)
  const refunds = rows.reduce((s, r) => s + r.refunds, 0)
  return { revenue, orders, aov: revenue / orders, refundRate: refunds / orders }
}
const money = (v: number) => `$${Math.round(v).toLocaleString("en-US")}`
const cents = (v: number) => `$${v.toFixed(2)}`
const count = (v: number) => Math.round(v).toLocaleString("en-US")
const rate = (v: number) => `${(v * 100).toFixed(1)}%`
const icons = {
  wallet: ["M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1", "M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"],
  "shopping-bag": [
    "M16 10a4 4 0 0 1-8 0",
    "M3.103 6.034h17.794",
    "M3.4 5.467a2 2 0 0 0-.4 1.2V20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6.667a2 2 0 0 0-.4-1.2l-2-2.667A2 2 0 0 0 17 2H7a2 2 0 0 0-1.6.8z",
  ],
  receipt: [
    "M12 17V7",
    "M16 8h-6a2 2 0 0 0 0 4h4a2 2 0 0 1 0 4H8",
    "M4 3a1 1 0 0 1 1-1 1.3 1.3 0 0 1 .7.2l.933.6a1.3 1.3 0 0 0 1.4 0l.934-.6a1.3 1.3 0 0 1 1.4 0l.933.6a1.3 1.3 0 0 0 1.4 0l.933-.6a1.3 1.3 0 0 1 1.4 0l.934.6a1.3 1.3 0 0 0 1.4 0l.933-.6A1.3 1.3 0 0 1 19 2a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1 1.3 1.3 0 0 1-.7-.2l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.934.6a1.3 1.3 0 0 1-1.4 0l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-1.4 0l-.934-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-.7.2 1 1 0 0 1-1-1z",
  ],
  "rotate-ccw": ["M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8", "M3 3v5h5"],
} as const
const span = ref("7")
const n = computed(() => Number(span.value))
const cards = computed(() => {
  const now = totals(DAYS - n.value, DAYS)
  const before = totals(DAYS - 2 * n.value, DAYS - n.value)
  const change = (a: number, b: number) => (a - b) / b
  const recent = history.slice(DAYS - n.value)
  return [
    { label: "Revenue", icon: "wallet" as const, value: now.revenue, format: money, delta: change(now.revenue, before.revenue), series: recent.map((r) => r.revenue), daily: money, downIsGood: undefined as boolean | undefined },
    { label: "Orders", icon: "shopping-bag" as const, value: now.orders, format: count, delta: change(now.orders, before.orders), series: recent.map((r) => r.orders), daily: (v: number) => `${count(v)} orders`, downIsGood: undefined },
    { label: "Average order", icon: "receipt" as const, value: now.aov, format: cents, delta: change(now.aov, before.aov), series: recent.map((r) => r.revenue / r.orders), daily: cents, downIsGood: undefined },
    { label: "Refund rate", icon: "rotate-ccw" as const, value: now.refundRate, format: rate, delta: change(now.refundRate, before.refundRate), series: recent.map((r) => r.refunds / r.orders), daily: rate, downIsGood: true },
  ]
})
const labels = computed(() =>
  history.slice(DAYS - n.value).map((_, i) => {
    const d = new Date(2026, 10, 19)
    d.setDate(d.getDate() - (n.value - 1 - i))
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }),
)
const setSpan = (next: unknown) => {
  if (next) span.value = String(next)
}
</script>

<template>
  <div data-demo="stat" class="@container w-full max-w-[1040px]" style="--stat-value-size: 28px; --stat-padding: 20px; --stat-radius: 16px; --stat-group-columns: 4">
    <div class="mb-3 flex flex-wrap items-center justify-between gap-3 px-1">
      <div class="text-[15px] font-semibold tracking-tight">Store overview</div>
      <SegmentedControl aria-label="Period" :value="span" @value-change="setSpan">
        <SegmentedControlItem value="7">7 days</SegmentedControlItem>
        <SegmentedControlItem value="30">30 days</SegmentedControlItem>
        <SegmentedControlItem value="90">90 days</SegmentedControlItem>
      </SegmentedControl>
    </div>
    <StatGroup :aria-label="`Store overview, last ${n} days`">
      <Stat v-for="c in cards" :key="c.label" :label="c.label" :value="c.value" :format-value="c.format" :delta="c.delta" :down-is-good="c.downIsGood" :loading="false">
        <StatLabel />
        <StatIcon>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            :class="`lucide lucide-${c.icon}`"
            aria-hidden="true"
          >
            <path v-for="d in icons[c.icon]" :key="d" :d="d" />
          </svg>
        </StatIcon>
        <StatValue />
        <StatDelta />
        <StatComparison>vs previous {{ n }} days</StatComparison>
        <StatChart>
          <Sparkline type="area" :data="c.series" :labels="labels" :label="`${c.label} per day`" :period="`last ${n} days`" :format-value="c.daily" :down-is-good="c.downIsGood" />
        </StatChart>
      </Stat>
    </StatGroup>
  </div>
</template>
