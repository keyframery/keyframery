import * as React from "react"

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
} from "@/components/ui/chart"

export const meta = { name: "Chart", group: "Data" }

/* The demo plays itself, as someone reading the year would: the pointer comes onto April, runs to
   August and on to December (the headline reads out each month it passes), leaves (the headline
   goes back to the year), then In store is switched off and on from the legend. */
const point = (i: number) => `[data-slot=chart-point][data-index="${i}"]`
export const play = [
  { wait: 1600 },
  { hover: point(3), wait: 1100 },
  { hover: point(5), wait: 450 },
  { hover: point(7), wait: 1000 },
  { hover: point(9), wait: 420 },
  { hover: point(11), wait: 1600 },
  { unhover: point(11), wait: 1200 },
  { click: '[data-slot=chart-legend-item][data-series="store"]', wait: 1700 },
  { click: '[data-slot=chart-legend-item][data-series="store"]', wait: 1900 },
]

/* What the Customize panel under the preview offers. The demo takes the same names as props. */
export const controls = {
  type: { type: "select", label: "Type", options: ["bar", "line", "area", "donut", "pie"], default: "bar" },
  series: { type: "slider", label: "Series", min: 1, max: 3, step: 1, default: 2 },
  stacked: { type: "switch", label: "Stacked", default: false },
  orientation: { type: "select", label: "Bars", options: ["vertical", "horizontal"], default: "vertical" },
  curve: { type: "select", label: "Curve", options: ["smooth", "linear"], default: "smooth" },
  title: { type: "text", label: "Title", default: "Net revenue" },
  grid: { type: "switch", label: "Grid", default: true, group: "Parts" },
  axes: { type: "switch", label: "Axes", default: true, group: "Parts" },
  legend: { type: "switch", label: "Legend", default: true, group: "Parts" },
  tooltip: { type: "switch", label: "Tooltip", default: true, group: "Parts" },
  dots: { type: "switch", label: "Dots on every point", default: false, group: "Parts" },
  height: { type: "slider", label: "Height", min: 180, max: 360, step: 4, default: 260, unit: "px", group: "Layout" },
  radius: { type: "slider", label: "Bar corners", min: 0, max: 12, step: 1, default: 4, unit: "px", group: "Layout" },
  gap: { type: "slider", label: "Bar gap", min: 0, max: 12, step: 1, default: 4, unit: "px", group: "Layout" },
  stroke: { type: "slider", label: "Line width", min: 1, max: 4, step: 0.5, default: 2, unit: "px", group: "Layout" },
  dot: { type: "slider", label: "Dot size", min: 4, max: 12, step: 1, default: 8, unit: "px", group: "Layout" },
  color1: { type: "color", label: "Series 1", default: "", group: "Colours" },
  color2: { type: "color", label: "Series 2", default: "", group: "Colours" },
  color3: { type: "color", label: "Series 3", default: "", group: "Colours" },
  gridColor: { type: "color", label: "Grid", default: "", group: "Colours" },
} as const

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

const money = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`
const thousands = (n: number) => (n === 0 ? "$0" : `$${n / 1000}k`)
const short = (month: string) => month.slice(0, 3)

type ChartKind = "bar" | "line" | "area" | "donut" | "pie"

export default function ChartDemo({
  type = "bar",
  series = 2,
  stacked = false,
  orientation = "vertical",
  curve = "smooth",
  title = "Net revenue",
  grid = true,
  axes = true,
  legend = true,
  tooltip = true,
  dots = false,
  height = 260,
  radius = 4,
  gap = 4,
  stroke = 2,
  dot = 8,
  color1 = "",
  color2 = "",
  color3 = "",
  gridColor = "",
}: {
  type?: ChartKind
  series?: number
  stacked?: boolean
  orientation?: "vertical" | "horizontal"
  curve?: "smooth" | "linear"
  title?: string
  grid?: boolean
  axes?: boolean
  legend?: boolean
  tooltip?: boolean
  dots?: boolean
  height?: number
  radius?: number
  gap?: number
  stroke?: number
  dot?: number
  color1?: string
  color2?: string
  color3?: string
  gridColor?: string
}) {
  const [active, setActive] = React.useState<number | null>(null)
  const [hidden, setHidden] = React.useState<string[]>([])
  const radial = type === "donut" || type === "pie"
  const shown = channels.slice(0, series)

  /* By month for bars, lines and areas; by channel for a ring. */
  const config: ChartConfig = radial
    ? { channel: { label: "Channel" }, revenue: { label: "Revenue" }, ...Object.fromEntries(shown.map((c) => [c.key, { label: c.label }])) }
    : { month: { label: "Month" }, ...Object.fromEntries(shown.map((c) => [c.key, { label: c.label }])) }
  /* Lying down, bars read best a few at a time: the second half of the year. */
  const across = type === "bar" && orientation === "horizontal"
  const rows = across ? year.slice(6) : year
  const range = across ? "July – December 2026" : "January – December 2026"
  const shortRange = across ? "Jul – Dec 2026" : "Jan – Dec 2026"
  const data = React.useMemo(
    () => (radial ? shown.map((c) => ({ channel: c.key, revenue: year.reduce((sum, row) => sum + row[c.key], 0) })) : rows),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [radial, series, across],
  )

  /* The headline: the year so far, or the month (or channel) under the pointer. */
  const visible = shown.filter((c) => !hidden.includes(c.key))
  const sumOf = (row: (typeof year)[number]) => visible.reduce((sum, c) => sum + row[c.key], 0)
  const at = active === null ? null : radial ? null : rows[active]
  const value = radial
    ? active === null
      ? shown.filter((c) => !hidden.includes(c.key)).reduce((sum, c) => sum + year.reduce((s, row) => s + row[c.key], 0), 0)
      : (data[active] as { revenue: number } | undefined)?.revenue ?? 0
    : at
      ? sumOf(at)
      : rows.reduce((sum, row) => sum + sumOf(row), 0)
  const caption = radial ? (active === null ? range : `${shown[active]?.label ?? ""}, 2026`) : at ? `${at.month} 2026` : range

  const vars = {
    "--chart-height": `${height}px`,
    "--chart-radius": `${radius}px`,
    "--chart-bar-gap": `${gap}px`,
    "--chart-stroke": `${stroke}px`,
    "--chart-dot": `${dot}px`,
    ...(color1 ? { "--chart-1": color1 } : null),
    ...(color2 ? { "--chart-2": color2 } : null),
    ...(color3 ? { "--chart-3": color3 } : null),
    ...(gridColor ? { "--chart-grid": gridColor } : null),
  } as React.CSSProperties

  return (
    <div className="@container w-full max-w-[640px]">
      <div
        style={vars}
        className="rounded-[18px] bg-background p-4 shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.04),0_12px_32px_-14px_rgb(0_0_0/0.14)] @[480px]:px-6 @[480px]:pt-5 @[480px]:pb-5 dark:bg-card dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07)]"
      >
        <div className="mb-4">
          <div className="flex items-baseline justify-between gap-3 text-[13px]">
            <div className="truncate font-medium text-muted-foreground">{title}</div>
            <div
              key={caption}
              className="shrink-0 animate-[kf-chart-rise_calc(360ms*var(--kf-speed,1))_var(--ease-spring)_backwards] text-[12px] text-muted-foreground tabular-nums motion-reduce:animate-none"
            >
              {caption === range ? (
                <>
                  <span className="@[480px]:hidden">{shortRange}</span>
                  <span className="hidden @[480px]:inline">{range}</span>
                </>
              ) : (
                caption
              )}
            </div>
          </div>
          <div className="mt-2 text-[26px] leading-none font-semibold tracking-tight tabular-nums @[480px]:text-[30px]">
            <Roll text={money(value)} />
          </div>
        </div>
        <Chart
          aria-label={`${title}, 2026`}
          type={type}
          data={data}
          config={config}
          categoryKey={radial ? "channel" : "month"}
          stacked={stacked}
          orientation={orientation}
          curve={curve}
          dots={dots}
          formatValue={money}
          formatTick={thousands}
          formatCategory={short}
          onActiveIndexChange={setActive}
          hiddenSeries={hidden}
          onHiddenSeriesChange={setHidden}
        >
          {legend ? <ChartLegend side="top" className="justify-start pb-4 -ml-2" /> : null}
          {axes ? <ChartYAxis /> : null}
          <ChartPlot>
            {grid ? <ChartGrid /> : null}
            <ChartCursor />
            <ChartMarks />
            <ChartCenter />
            {tooltip ? <ChartTooltip /> : null}
          </ChartPlot>
          {axes ? <ChartXAxis /> : null}
        </Chart>
      </div>
    </div>
  )
}
