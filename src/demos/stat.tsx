import { Receipt, RotateCcw, ShoppingBag, Wallet } from "lucide-react"
import * as React from "react"

import { SegmentedControl, SegmentedControlItem } from "@/components/ui/segmented-control"
import { Sparkline } from "@/components/ui/sparkline"
import { Stat, StatChart, StatComparison, StatDelta, StatGroup, StatIcon, StatLabel, StatValue } from "@/components/ui/stat"

export const meta = { name: "Stat", group: "Data" }

/* The demo plays itself: the store's week, then its month, then its quarter. Every value rolls,
   the deltas turn (revenue dipped this week but grew over the month), the sparklines tween into
   the longer span, and it goes back to the week. */
const period = (n: number) => `[aria-label="Period"] [data-slot="segmented-control-item"]:nth-of-type(${n})`
export const play = [
  { wait: 2000 },
  { click: period(2), wait: 2600 },
  { click: period(3), wait: 2600 },
  { hover: '[aria-label="Revenue"] [data-slot=sparkline-point][data-index="70"]', wait: 1300 },
  { unhover: '[aria-label="Revenue"] [data-slot=sparkline-point][data-index="70"]', wait: 400 },
  { click: period(1), wait: 2600 },
]

/* What the Customize panel under the preview offers. The demo takes the same names as props. */
export const controls = {
  days: { type: "select", label: "Days shown", options: ["7", "30", "90"], default: "7" },
  chart: { type: "select", label: "Sparkline", options: ["area", "line", "bar", "none"], default: "area" },
  icons: { type: "switch", label: "Icons", default: true },
  comparison: { type: "switch", label: "Comparison line", default: true },
  loading: { type: "switch", label: "Loading", default: false },
  refundsDownIsGood: { type: "switch", label: "Falling refunds are good", default: true },
  stats: { type: "slider", label: "Stats", min: 1, max: 4, step: 1, default: 4 },
  title: { type: "text", label: "Title", default: "Store overview" },
  columns: { type: "slider", label: "Columns on wide screens", min: 2, max: 4, step: 1, default: 4, group: "Layout" },
  size: { type: "slider", label: "Number size", min: 20, max: 40, step: 1, default: 28, unit: "px", group: "Layout" },
  padding: { type: "slider", label: "Padding", min: 12, max: 32, step: 2, default: 20, unit: "px", group: "Layout" },
  radius: { type: "slider", label: "Corners", min: 0, max: 28, step: 1, default: 16, unit: "px", group: "Layout" },
  positive: { type: "color", label: "Good news", default: "", group: "Colours" },
  negative: { type: "color", label: "Bad news", default: "", group: "Colours" },
  surface: { type: "color", label: "Surface", default: "", group: "Colours" },
  divider: { type: "color", label: "Dividers", default: "", group: "Colours" },
} as const

/* 180 days of a small store, oldest first: steady growth, a weekly rhythm, a soft last week (fewer
   orders, but larger ones) and a run of returns in the last few days. The same on every load. */
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

type Days = "7" | "30" | "90"
type Chart = "area" | "line" | "bar" | "none"

export default function StatDemo({
  days = "7",
  chart = "area",
  icons = true,
  comparison = true,
  loading = false,
  refundsDownIsGood = true,
  stats = 4,
  title = "Store overview",
  columns = 4,
  size = 28,
  padding = 20,
  radius = 16,
  positive = "",
  negative = "",
  surface = "",
  divider = "",
}: {
  days?: Days
  chart?: Chart
  icons?: boolean
  comparison?: boolean
  loading?: boolean
  refundsDownIsGood?: boolean
  stats?: number
  title?: string
  columns?: number
  size?: number
  padding?: number
  radius?: number
  positive?: string
  negative?: string
  surface?: string
  divider?: string
}) {
  const [span, setSpan] = React.useState<Days>(days)
  React.useEffect(() => setSpan(days), [days])
  const n = Number(span)
  const now = totals(DAYS - n, DAYS)
  const before = totals(DAYS - 2 * n, DAYS - n)
  const change = (a: number, b: number) => (a - b) / b
  const recent = history.slice(DAYS - n)
  const labels = recent.map((_, i) => {
    const d = new Date(2026, 10, 19)
    d.setDate(d.getDate() - (n - 1 - i))
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  })
  const versus = `vs previous ${n} days`

  const cards = [
    { label: "Revenue", icon: Wallet, value: now.revenue, format: money, delta: change(now.revenue, before.revenue), series: recent.map((r) => r.revenue), daily: money },
    { label: "Orders", icon: ShoppingBag, value: now.orders, format: count, delta: change(now.orders, before.orders), series: recent.map((r) => r.orders), daily: (v: number) => `${count(v)} orders` },
    { label: "Average order", icon: Receipt, value: now.aov, format: cents, delta: change(now.aov, before.aov), series: recent.map((r) => r.revenue / r.orders), daily: cents },
    { label: "Refund rate", icon: RotateCcw, value: now.refundRate, format: rate, delta: change(now.refundRate, before.refundRate), series: recent.map((r) => r.refunds / r.orders), daily: rate, downIsGood: refundsDownIsGood },
  ].slice(0, stats)

  const vars = {
    "--stat-value-size": `${size}px`,
    "--stat-padding": `${padding}px`,
    "--stat-radius": `${radius}px`,
    "--stat-group-columns": Math.min(columns, stats),
    ...(positive ? { "--stat-positive": positive } : null),
    ...(negative ? { "--stat-negative": negative } : null),
    ...(surface ? { "--stat-surface": surface } : null),
    ...(divider ? { "--stat-divider": divider } : null),
  } as React.CSSProperties

  return (
    <div className="@container w-full max-w-[1040px]" style={vars}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="text-[15px] font-semibold tracking-tight">{title}</div>
        <SegmentedControl aria-label="Period" value={span} onValueChange={(next) => next && setSpan(next as Days)}>
          <SegmentedControlItem value="7">7 days</SegmentedControlItem>
          <SegmentedControlItem value="30">30 days</SegmentedControlItem>
          <SegmentedControlItem value="90">90 days</SegmentedControlItem>
        </SegmentedControl>
      </div>
      <StatGroup aria-label={`${title}, last ${n} days`}>
        {cards.map((c) => (
          <Stat key={c.label} label={c.label} value={c.value} formatValue={c.format} delta={c.delta} downIsGood={c.downIsGood} loading={loading}>
            <StatLabel />
            {icons ? (
              <StatIcon>
                <c.icon />
              </StatIcon>
            ) : null}
            <StatValue />
            <StatDelta />
            {comparison ? <StatComparison>{versus}</StatComparison> : null}
            {chart === "none" ? null : (
              <StatChart>
                <Sparkline
                  type={chart}
                  data={c.series}
                  labels={labels}
                  label={`${c.label} per day`}
                  period={`last ${n} days`}
                  formatValue={c.daily}
                  downIsGood={c.downIsGood}
                />
              </StatChart>
            )}
          </Stat>
        ))}
      </StatGroup>
    </div>
  )
}
