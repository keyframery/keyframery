import * as React from "react"

import { SegmentedControl, SegmentedControlItem } from "@/components/ui/segmented-control"
import { percent, Sparkline } from "@/components/ui/sparkline"

export const meta = { name: "Sparkline", group: "Data" }

/* The demo plays itself: someone scrubs the overshirt's last month, switches to the last week (every
   line tweens into its new shape), reads the beanie's week, and goes back to the month. */
const row = (id: string, i: number) => `[data-product="${id}"] [data-slot=sparkline-point][data-index="${i}"]`
const period = (value: string) => `[aria-label="Period"] [data-slot="segmented-control-item"]:nth-of-type(${value === "7" ? 1 : 2})`
export const play = [
  { wait: 1700 },
  { hover: row("overshirt", 9), wait: 700 },
  { hover: row("overshirt", 18), wait: 500 },
  { hover: row("overshirt", 27), wait: 1100 },
  { unhover: row("overshirt", 27), wait: 500 },
  { click: period("7"), wait: 1700 },
  { hover: row("beanie", 2), wait: 600 },
  { hover: row("beanie", 5), wait: 1100 },
  { unhover: row("beanie", 5), wait: 500 },
  { click: period("30"), wait: 1900 },
]

/* What the Customize panel under the preview offers. The demo takes the same names as props. */
export const controls = {
  type: { type: "select", label: "Type", options: ["area", "line", "bar"], default: "area" },
  curve: { type: "select", label: "Curve", options: ["smooth", "linear"], default: "smooth" },
  days: { type: "select", label: "Days shown", options: ["7", "30"], default: "30" },
  trendColor: { type: "switch", label: "Colour by trend", default: true },
  extremes: { type: "switch", label: "Mark high and low", default: false },
  reference: { type: "switch", label: "Last period's average", default: false },
  rows: { type: "slider", label: "Products", min: 1, max: 4, step: 1, default: 4 },
  title: { type: "text", label: "Title", default: "Best sellers" },
  height: { type: "slider", label: "Height", min: 20, max: 56, step: 2, default: 32, unit: "px", group: "Layout" },
  width: { type: "slider", label: "Width", min: 72, max: 200, step: 4, default: 132, unit: "px", group: "Layout" },
  stroke: { type: "slider", label: "Line width", min: 1, max: 3, step: 0.25, default: 1.75, unit: "px", group: "Layout" },
  dot: { type: "slider", label: "Dot size", min: 4, max: 10, step: 1, default: 6, unit: "px", group: "Layout" },
  color: { type: "color", label: "Line", default: "", group: "Colours" },
  positive: { type: "color", label: "Rising", default: "", group: "Colours" },
  negative: { type: "color", label: "Falling", default: "", group: "Colours" },
} as const

/* Units sold per day for the last 60 days, oldest first: a slow drift, a weekly rhythm and a little
   noise, the same on every load. */
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

type Days = "7" | "30"

export default function SparklineDemo({
  type = "area",
  curve = "smooth",
  days = "30",
  trendColor = true,
  extremes = false,
  reference = false,
  rows = 4,
  title = "Best sellers",
  height = 32,
  width = 132,
  stroke = 1.75,
  dot = 6,
  color = "",
  positive = "",
  negative = "",
}: {
  type?: "area" | "line" | "bar"
  curve?: "smooth" | "linear"
  days?: Days
  trendColor?: boolean
  extremes?: boolean
  reference?: boolean
  rows?: number
  title?: string
  height?: number
  width?: number
  stroke?: number
  dot?: number
  color?: string
  positive?: string
  negative?: string
}) {
  const [span, setSpan] = React.useState<Days>(days)
  React.useEffect(() => setSpan(days), [days])
  const n = Number(span)
  const labels = React.useMemo(() => Array.from({ length: n }, (_, i) => dayLabel(n - 1 - i)), [n])

  const vars = {
    "--sparkline-height": `${height}px`,
    "--sparkline-stroke": `${stroke}px`,
    "--sparkline-dot": `${dot}px`,
    ...(color ? { "--sparkline-color": color } : null),
    ...(positive ? { "--sparkline-positive": positive } : null),
    ...(negative ? { "--sparkline-negative": negative } : null),
  } as React.CSSProperties

  return (
    <div className="@container w-full max-w-[560px]">
      <div
        style={vars}
        className="rounded-[18px] bg-background p-2 shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.04),0_12px_32px_-14px_rgb(0_0_0/0.14)] dark:bg-card dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07)]"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 px-3 pt-2 pb-3">
          <div className="min-w-[9rem] flex-1">
            <div className="truncate text-[15px] font-semibold tracking-tight">{title}</div>
            <div className="mt-1 text-[12px] text-muted-foreground">Units sold per day</div>
          </div>
          <SegmentedControl aria-label="Period" value={span} onValueChange={(next) => next && setSpan(next as Days)}>
            <SegmentedControlItem value="7">7 days</SegmentedControlItem>
            <SegmentedControlItem value="30">30 days</SegmentedControlItem>
          </SegmentedControl>
        </div>
        <ul>
          {products.slice(0, rows).map((p) => {
            const now = p.sales.slice(-n)
            const before = p.sales.slice(-2 * n, -n)
            const total = now.reduce((a, b) => a + b, 0)
            const prior = before.reduce((a, b) => a + b, 0)
            const change = (total - prior) / prior
            const flat = Math.abs(change) < 0.01
            const up = change > 0
            return (
              <li
                key={p.id}
                data-product={p.id}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 px-3 py-3 @[440px]:grid-cols-[minmax(0,1fr)_var(--w)_5.5rem] [&+li]:border-t [&+li]:border-[color:color-mix(in_oklch,var(--border)_70%,transparent)]"
                style={{ "--w": `${width}px` } as React.CSSProperties}
              >
                <div className="min-w-0">
                  <div className="truncate text-[13px] leading-[1.3] font-medium">{p.name}</div>
                  <div className="mt-0.5 truncate text-[12px] leading-[1.3] text-muted-foreground">{p.kind}</div>
                </div>
                <Sparkline
                  className="col-span-2 row-start-2 @[440px]:col-span-1 @[440px]:row-start-auto"
                  data={now}
                  labels={labels}
                  type={type}
                  curve={curve}
                  trendColor={trendColor}
                  extremes={extremes}
                  reference={reference ? prior / n : null}
                  label={`${p.name}, units sold per day`}
                  period={`last ${n} days`}
                  formatValue={units}
                />
                <div className="text-right">
                  <div className="text-[13px] leading-[1.3] font-medium tabular-nums">{total.toLocaleString("en-US")}</div>
                  <div
                    className={
                      "mt-0.5 text-[12px] leading-[1.3] font-medium tabular-nums " +
                      (flat ? "text-muted-foreground" : up ? "text-[oklch(0.55_0.15_150)] dark:text-[oklch(0.74_0.16_150)]" : "text-destructive")
                    }
                  >
                    {flat ? "No change" : `${up ? "+" : "−"}${percent(change)}`}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
