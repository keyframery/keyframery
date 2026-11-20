/* A chart, as UI SDK primitives. UI SDK ships no chart, so it is defined with its core: the same
   definition renders in React, Vue, Svelte, Solid and web components.

   One primitive draws bars (grouped or stacked, vertical or horizontal), lines, areas (stacked
   too) and pies or donuts from rows of data and a shadcn-style config:

     data   = [{ month: "Jan", revenue: 4200, costs: 3100 }, …]
     config = { revenue: { label: "Revenue", color: "var(--chart-1)" }, costs: { label: "Costs" } }

   The behaviour lives here: which point is active (hovered, focused or chosen), which series are
   hidden (toggled from the legend), one tab stop over the points with arrow keys, Home and End,
   names for every point, and the geometry every part draws from. Geometry goes out as CSS
   variables in percent of the plot, so the marks lay out on the server and CSS can tween every
   change: bars grow, lines redraw, slices sweep.

   The math at the bottom of the file (scales, nice ticks, stacking, monotone curves, rings) is
   plain functions with no DOM, exported for anyone who draws a chart of their own. */

import { type ChangeDetails, createChange, createRovingFocus, css, definePrimitive } from "@ui-sdk/core"

/* ---------------------------------------------------------------- types */

/** What the chart draws. `pie` and `donut` are the same ring with a different hole. */
type ChartType = "bar" | "line" | "area" | "pie" | "donut"
/** `vertical` bars stand up from the bottom; `horizontal` bars run from the left. Lines and areas are always vertical. */
type ChartOrientation = "vertical" | "horizontal"
/** How lines and areas join their points: straight, or a smooth curve that never overshoots a point. */
type ChartCurve = "linear" | "smooth"
type ChartDatum = Record<string, unknown>

/** One series, or one slice of a pie: what it is called and its colour. Like shadcn's `ChartConfig`. */
type ChartSeriesConfig<Icon = unknown> = {
  label?: string
  /** Any CSS colour. Leave it out to take the next of `--chart-1` … `--chart-5`. */
  color?: string
  /** An icon your framework renders in the legend and tooltip, like a React component. */
  icon?: Icon
}
type ChartConfig<Icon = unknown> = Record<string, ChartSeriesConfig<Icon>>

/** Formats a number for the tooltip, the point names and the data table. */
type ChartValueFormatter = (value: number, series: string) => string
/** Formats a number on the value axis. */
type ChartTickFormatter = (value: number) => string
/** Formats a category on the category axis, like "January" to "Jan". */
type ChartCategoryFormatter = (category: string, index: number) => string

type ActiveReason = "item-hover" | "item-press" | "list-navigation" | "focus-in" | "focus-out" | "escape-key" | "pointer-leave"
type HiddenReason = "item-press"

type ChartOptions = {
  /** The rows. Each has the category under `categoryKey` and a number under each series' key. */
  data?: ChartDatum[]
  /** The series, by the key their numbers have in `data`, in the order they stack and list. */
  config?: ChartConfig
  /** The key that names each row: the category of a bar or line chart, the slice of a pie. */
  categoryKey?: string
  type?: ChartType
  /** Stacks bars or areas on one another instead of side by side. */
  stacked?: boolean
  orientation?: ChartOrientation
  curve?: ChartCurve
  /** The share of each category left empty between bar groups, 0 to 0.9. Defaults to 0.3. */
  categoryGap?: number
  /** The donut's hole as a share of its radius, 0 to 0.9. Defaults to 0.6 for a donut, 0 for a pie. */
  innerRadius?: number
  /** Degrees of space between slices. Defaults to 1.5. */
  padAngle?: number
  /** Shows a dot on every point of a line or area, not only the active one. */
  dots?: boolean
  formatValue?: ChartValueFormatter
  formatTick?: ChartTickFormatter
  formatCategory?: ChartCategoryFormatter
  /** The point (row index) that is active, controlled. `null` for none. */
  activeIndex?: number | null
  defaultActiveIndex?: number | null
  /** Runs when a point is hovered, focused, pressed or let go. */
  onActiveIndexChange?: (index: number | null, details: ChangeDetails<ActiveReason>) => void
  /** The series keys (slice categories for a pie) that are hidden, controlled. */
  hiddenSeries?: string[]
  defaultHiddenSeries?: string[]
  /** Runs when a legend item is pressed. The last visible series can't be hidden. */
  onHiddenSeriesChange?: (hidden: string[], details: ChangeDetails<HiddenReason>) => void
}

type Inputs = {
  data: ChartDatum[]
  config: ChartConfig
  categoryKey: string
  type: ChartType
  stacked: boolean
  orientation: ChartOrientation
  curve: ChartCurve
  categoryGap: number
  innerRadius: number
  padAngle: number
  dots: boolean
  formatValue: ChartValueFormatter
  formatTick: ChartTickFormatter
  formatCategory: ChartCategoryFormatter
  hiddenSeries: string[]
  /** The plot's size in pixels, once it has been measured. 0 on the server. */
  width: number
  height: number
}

type ChartState = Inputs & {
  activeIndex: number | null
  /** The row that was active last. The cursor and tooltip fade out where they were, not elsewhere. */
  lastIndex: number | null
  /** The key of the point with the tab stop. */
  focused: string | null
  layout: ChartLayout
}

/* ---------------------------------------------------------------- defaults */

const groupFormat = new Intl.NumberFormat("en-US")
const compactFormat = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 })
const defaultFormatValue: ChartValueFormatter = (value) => groupFormat.format(value)
const defaultFormatTick: ChartTickFormatter = (value) => compactFormat.format(value)
const defaultFormatCategory: ChartCategoryFormatter = (category) => category
const emptyData: ChartDatum[] = []
const emptyConfig: ChartConfig = {}
const emptyList: string[] = []

const isRadial = (type: ChartType) => type === "pie" || type === "donut"
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const round = (value: number) => Math.round(value * 100) / 100

function inputsOf(options: ChartOptions): Omit<Inputs, "hiddenSeries" | "width" | "height"> {
  const type = options.type ?? "bar"
  return {
    data: options.data ?? emptyData,
    config: options.config ?? emptyConfig,
    categoryKey: options.categoryKey ?? "name",
    type,
    stacked: options.stacked ?? false,
    orientation: type === "bar" ? (options.orientation ?? "vertical") : "vertical",
    curve: options.curve ?? "smooth",
    categoryGap: clamp(options.categoryGap ?? 0.3, 0, 0.9),
    innerRadius: clamp(options.innerRadius ?? (type === "donut" ? 0.6 : 0), 0, 0.9),
    padAngle: clamp(options.padAngle ?? 1.5, 0, 20),
    dots: options.dots ?? false,
    formatValue: options.formatValue ?? defaultFormatValue,
    formatTick: options.formatTick ?? defaultFormatTick,
    formatCategory: options.formatCategory ?? defaultFormatCategory,
  }
}

/* ---------------------------------------------------------------- math */

/** A number from a row, or 0 when it isn't one. */
function numberOf(row: ChartDatum | undefined, key: string) {
  const value = Number(row?.[key])
  return Number.isFinite(value) ? value : 0
}

/** A step of 1, 2 or 5 times a power of ten that splits `span` into about `count` parts. */
function niceStep(span: number, count: number) {
  const raw = span / Math.max(1, count)
  const power = 10 ** Math.floor(Math.log10(raw))
  const unit = raw / power
  return (unit >= 7.5 ? 10 : unit >= 3.5 ? 5 : unit >= 1.5 ? 2 : 1) * power
}

/** Round ticks covering `min` to `max`, about `count` of them, and the domain they span. */
function niceTicks(min: number, max: number, count = 5) {
  if (!(max > min)) max = min + 1
  const step = niceStep(max - min, count)
  const lo = Math.floor(min / step + 1e-9) * step
  const hi = Math.ceil(max / step - 1e-9) * step
  const ticks: number[] = []
  for (let value = lo; value <= hi + step / 2; value += step) ticks.push(round(value / step) * step)
  return { domain: [lo, hi] as [number, number], ticks, step }
}

/** Maps a value in `domain` to `range`, linearly. */
function linearScale([d0, d1]: [number, number], [r0, r1]: [number, number]) {
  const span = d1 - d0 || 1
  return (value: number) => r0 + ((value - d0) / span) * (r1 - r0)
}

type Point = { x: number; y: number }

/** A straight line through the points, as an SVG path. */
function linearPath(points: Point[]) {
  return points.map((p, i) => `${i ? "L" : "M"}${round(p.x)},${round(p.y)}`).join("")
}

/* Monotone cubic interpolation along x (Fritsch–Carlson, as d3's curveMonotoneX): smooth, and it
   never overshoots a point, so a value never looks higher than it was. Works for x running either
   way, which an area's lower edge needs. */
function slope3(p0: Point, p1: Point, p2: Point) {
  const h0 = p1.x - p0.x
  const h1 = p2.x - p1.x
  const s0 = (p1.y - p0.y) / (h0 || (h1 < 0 ? -0 : 0))
  const s1 = (p2.y - p1.y) / (h1 || (h0 < 0 ? -0 : 0))
  const p = (s0 * h1 + s1 * h0) / (h0 + h1)
  return (Math.sign(s0) + Math.sign(s1)) * Math.min(Math.abs(s0), Math.abs(s1), 0.5 * Math.abs(p)) || 0
}
function slope2(p0: Point, p1: Point, t: number) {
  const h = p1.x - p0.x
  return h ? ((3 * (p1.y - p0.y)) / h - t) / 2 : t
}

/** A smooth line through the points, as an SVG path. Always `M` then one `C` per segment, so two
    paths with the same number of points tween. */
function monotonePath(points: Point[], move = true) {
  const n = points.length
  if (n === 0) return ""
  const start = `${move ? "M" : "L"}${round(points[0].x)},${round(points[0].y)}`
  if (n === 1) return start
  const t = new Array<number>(n).fill(0)
  for (let i = 1; i < n - 1; i++) t[i] = slope3(points[i - 1], points[i], points[i + 1])
  t[0] = n > 2 ? slope2(points[0], points[1], t[1]) : (points[1].y - points[0].y) / (points[1].x - points[0].x || 1)
  t[n - 1] = n > 2 ? slope2(points[n - 1], points[n - 2], t[n - 2]) : t[0]
  let d = start
  for (let i = 0; i < n - 1; i++) {
    const a = points[i]
    const b = points[i + 1]
    const dx = (b.x - a.x) / 3
    d += `C${round(a.x + dx)},${round(a.y + dx * t[i])},${round(b.x - dx)},${round(b.y - dx * t[i + 1])},${round(b.x)},${round(b.y)}`
  }
  return d
}

function linePath(points: Point[], curve: ChartCurve) {
  return curve === "smooth" ? monotonePath(points) : linearPath(points)
}

/** The band between an upper and a lower line, as one closed SVG path. */
function areaPath(upper: Point[], lower: Point[], curve: ChartCurve) {
  if (!upper.length) return ""
  const back = [...lower].reverse()
  const tail = curve === "smooth" ? monotonePath(back, false) : back.map((p) => `L${round(p.x)},${round(p.y)}`).join("")
  return `${linePath(upper, curve)}${tail}Z`
}

/** Stacks series on one another: for each row, where each series starts and ends. Positive and
    negative values stack away from zero separately. Hidden series take no room. */
function stackSeries(data: ChartDatum[], keys: string[], hidden: (key: string) => boolean = () => false) {
  return data.map((row) => {
    let up = 0
    let down = 0
    const spans: Record<string, [number, number]> = {}
    for (const key of keys) {
      const value = hidden(key) ? 0 : numberOf(row, key)
      if (value >= 0) {
        spans[key] = [up, up + value]
        up += value
      } else {
        spans[key] = [down + value, down]
        down += value
      }
    }
    return spans
  })
}

/** Where a slice of a ring sits on a circle with `pathLength` 100, starting at the top. */
type RingSlice = { start: number; length: number }

/** Splits a ring of 100 into slices for the values, with `pad` between them. */
function ringSlices(values: number[], padAngle: number): RingSlice[] {
  const total = values.reduce((sum, v) => sum + Math.max(0, v), 0)
  const shown = values.filter((v) => v > 0).length
  const pad = shown > 1 ? (padAngle / 360) * 100 : 0
  let at = 0
  return values.map((value) => {
    const share = total > 0 ? (Math.max(0, value) / total) * 100 : 0
    const slice = { start: at + (share > pad ? pad / 2 : share / 2), length: Math.max(0, share - pad) }
    at += share
    return slice
  })
}

/** A point on the ring, in a 0–100 box, `at` percent of the way round from the top. */
function ringPoint(at: number, radius: number): Point {
  const angle = (at / 100) * Math.PI * 2 - Math.PI / 2
  return { x: 50 + radius * Math.cos(angle), y: 50 + radius * Math.sin(angle) }
}

/* ---------------------------------------------------------------- layout */

type ChartSeries = { key: string; label: string; color: string; hidden: boolean; index: number }
/** A bar, in percent of the plot: `x`/`w` across, `y`/`h` up from the bottom (vertical) or `y`/`h`
    down from the top and `x`/`w` from the left (horizontal). */
type ChartBar = { series: string; category: string; index: number; x: number; w: number; y: number; h: number; start: boolean; end: boolean; negative: boolean; hidden: boolean; /** Its place in a stack, from the baseline: 0, 1, 2… (0 when not stacked). */ stack: number }
/** A tick: `pos` in percent along its axis from the start of the value scale (bottom or left) or
    the category axis (left or top). `zero` marks the baseline. */
type ChartTick = { key: string; pos: number; label: string; shown: boolean; zero: boolean }
type ChartSlice = { category: string; index: number; start: number; length: number; hidden: boolean; color: string; label: string; value: number; share: number; mid: Point }

type ChartLayout = {
  radial: boolean
  categories: string[]
  /** Category names in full, for the tooltip and the point names. */
  labels: string[]
  series: ChartSeries[]
  categoryTicks: ChartTick[]
  valueTicks: ChartTick[]
  /** Where each category's band starts and how wide it is, in percent along the category axis. */
  bands: { start: number; size: number; center: number }[]
  bars: Record<string, ChartBar>
  barKeys: string[]
  /** Each series' points, in a 0–100 box with y down. */
  points: Record<string, Point[]>
  lines: Record<string, string>
  areas: Record<string, string>
  slices: Record<string, ChartSlice>
  sliceKeys: string[]
  ring: { radius: number; width: number }
  /** Where the tooltip points for each category, in percent of the plot (y down). */
  anchors: Point[]
  total: number
}

const barKey = (series: string, category: string) => `${series}\u001f${category}`
const cssName = (key: string) => key.replace(/[^\w-]/g, "-")
const pct = (value: number) => round(value)

function seriesOf(input: Inputs): ChartSeries[] {
  const { data, config, categoryKey } = input
  if (isRadial(input.type)) {
    /* A pie draws one series; its slices are the rows. */
    const key = Object.keys(config).find((k) => k !== categoryKey && data.some((row) => typeof row[k] === "number")) ?? "value"
    return [{ key, label: config[key]?.label ?? key, color: `var(--color-${cssName(key)},var(--chart-1))`, hidden: false, index: 0 }]
  }
  return Object.keys(config)
    .filter((key) => key !== categoryKey && data.some((row) => typeof row[key] === "number"))
    .map((key, index) => ({
      key,
      label: config[key]?.label ?? key,
      color: `var(--color-${cssName(key)})`,
      hidden: input.hiddenSeries.includes(key),
      index,
    }))
}

/** Everything the parts draw, from the data, the options, the hidden series and the plot's size. */
function chartLayout(input: Inputs): ChartLayout {
  const { data, categoryKey, type, stacked, orientation, curve } = input
  const categories = data.map((row, i) => String(row[categoryKey] ?? i))
  const labels = categories
  const series = seriesOf(input)
  const radial = isRadial(type)
  const empty: ChartLayout = {
    radial, categories, labels, series, categoryTicks: [], valueTicks: [], bands: [], bars: {}, barKeys: [], points: {}, lines: {}, areas: {},
    slices: {}, sliceKeys: [], ring: { radius: 0, width: 0 }, anchors: [], total: 0,
  }
  if (!data.length || !series.length) return empty

  if (radial) {
    const key = series[0].key
    const values = data.map((row, i) => (input.hiddenSeries.includes(categories[i]) ? 0 : Math.max(0, numberOf(row, key))))
    const total = values.reduce((a, b) => a + b, 0)
    const outer = 46
    const inner = outer * input.innerRadius
    const radius = (outer + inner) / 2
    const ring = ringSlices(values, input.padAngle)
    const slices: Record<string, ChartSlice> = {}
    categories.forEach((category, i) => {
      const slice = ring[i]
      const color = `var(--color-${cssName(category)},${input.config[category]?.color ?? `var(--chart-${(i % 5) + 1})`})`
      slices[category] = {
        category,
        index: i,
        start: round(slice.start),
        length: round(slice.length),
        hidden: input.hiddenSeries.includes(category),
        color,
        label: input.config[category]?.label ?? category,
        value: values[i],
        share: total ? values[i] / total : 0,
        mid: ringPoint(slice.start + slice.length / 2, radius),
      }
    })
    return {
      ...empty,
      slices,
      sliceKeys: categories,
      ring: { radius: round(radius), width: round(outer - inner) },
      /* A ring's tooltip sits just outside its slice, clear of the hole's readout. */
      anchors: categories.map((c) => ringPoint(slices[c].start + slices[c].length / 2, outer + 4)),
      total,
    }
  }

  const visible = series.filter((s) => !s.hidden)
  const keys = series.map((s) => s.key)
  const isHidden = (key: string) => input.hiddenSeries.includes(key)
  const stacks = stackSeries(data, keys, isHidden)
  const vertical = orientation === "vertical" || type !== "bar"
  const doStack = stacked && type !== "line"

  /* The value domain always holds zero, so bars and areas rise from a real baseline. */
  let min = 0
  let max = 0
  data.forEach((row, i) => {
    for (const s of visible) {
      const [lo, hi] = doStack ? stacks[i][s.key] : [numberOf(row, s.key), numberOf(row, s.key)]
      min = Math.min(min, lo, hi)
      max = Math.max(max, lo, hi)
    }
  })
  const valueLength = vertical ? input.height : input.width
  const tickCount = valueLength ? clamp(Math.round(valueLength / (vertical ? 52 : 96)), 2, 6) : 5
  const { domain, ticks } = niceTicks(min, max, tickCount)
  const value = linearScale(domain, [0, 100])
  /* Keyed by place, not value, so a tick glides to its new value when the scale changes. */
  const valueTicks: ChartTick[] = ticks.map((tick, i) => ({ key: `\u001f${i}`, pos: pct(value(tick)), label: input.formatTick(tick), shown: true, zero: tick === 0 }))

  /* Bars sit in bands; lines and areas run edge to edge, with a little room for their dots. */
  const n = data.length
  const pointScale = type !== "bar"
  const inset = n > 1 ? 2.5 : 50
  const bands = categories.map((_, i) => {
    if (pointScale) {
      const center = n > 1 ? inset + (i / (n - 1)) * (100 - inset * 2) : 50
      const size = n > 1 ? (100 - inset * 2) / (n - 1) : 100
      return { start: center - size / 2, size, center }
    }
    return { start: (i / n) * 100, size: 100 / n, center: ((i + 0.5) / n) * 100 }
  })

  /* Category labels: thin them out until they fit side by side. */
  const categoryLength = vertical ? input.width : input.height
  const formatted = categories.map((c, i) => input.formatCategory(c, i))
  const widest = Math.max(...formatted.map((l) => l.length))
  const room = vertical ? widest * 6.6 + 14 : 18
  const fits = categoryLength ? Math.max(1, Math.floor(categoryLength / room)) : n
  const every = Math.max(1, Math.ceil(n / fits))
  const categoryTicks: ChartTick[] = categories.map((c, i) => ({
    key: c,
    pos: pct(bands[i].center),
    label: formatted[i],
    shown: i % every === 0,
    zero: false,
  }))

  const base = value(0)
  const bars: Record<string, ChartBar> = {}
  const barKeys: string[] = []
  const points: Record<string, Point[]> = {}
  const lines: Record<string, string> = {}
  const areas: Record<string, string> = {}
  const anchors: Point[] = []

  if (type === "bar") {
    categories.forEach((category, i) => {
      const band = bands[i]
      const group = band.size * (1 - input.categoryGap)
      const groupStart = band.center - group / 2
      const slot = doStack ? group : group / Math.max(1, visible.length)
      /* Which visible series is first and last in this category's stack, for the rounded ends. */
      const filled = visible.filter((s) => numberOf(data[i], s.key) !== 0)
      let before = 0
      let reach = base
      for (const s of series) {
        const raw = numberOf(data[i], s.key)
        const [lo, hi] = doStack ? stacks[i][s.key] : raw >= 0 ? [0, raw] : [raw, 0]
        const y0 = value(lo)
        const y1 = value(hi)
        const x = doStack ? groupStart : groupStart + before * slot
        bars[barKey(s.key, category)] = {
          series: s.key,
          category,
          index: i,
          x: pct(x),
          w: s.hidden ? 0 : pct(slot),
          y: pct(s.hidden ? (raw < 0 ? y1 : y0) : y0),
          h: s.hidden ? 0 : pct(y1 - y0),
          start: !doStack || filled[0]?.key === s.key,
          end: !doStack || filled.at(-1)?.key === s.key,
          negative: raw < 0,
          hidden: s.hidden,
          stack: doStack ? Math.max(0, visible.findIndex((v) => v.key === s.key)) : 0,
        }
        barKeys.push(barKey(s.key, category))
        if (!s.hidden) {
          before += 1
          reach = Math.max(reach, y1)
        }
      }
      anchors.push(vertical ? { x: band.center, y: 100 - reach } : { x: reach, y: band.center })
    })
    if (!vertical) {
      /* Horizontal: the first category sits at the top. Bands run down, values run right. */
      for (const key of barKeys) {
        const bar = bars[key]
        bars[key] = { ...bar, x: bar.y, w: bar.h, y: bar.x, h: bar.w }
      }
    }
  } else {
    const lower: Record<string, Point[]> = {}
    for (const s of series) {
      points[s.key] = data.map((row, i) => {
        const [lo, hi] = doStack ? stacks[i][s.key] : [0, numberOf(row, s.key)]
        /* A hidden series flattens onto its baseline instead of vanishing. */
        const y = s.hidden ? (doStack ? value(lo) : base) : value(hi)
        return { x: bands[i].center, y: round(100 - y) }
      })
      lower[s.key] = data.map((row, i) => ({ x: bands[i].center, y: round(100 - (doStack ? value(stacks[i][s.key][0]) : base)) }))
      lines[s.key] = linePath(points[s.key], curve)
      if (type === "area") areas[s.key] = areaPath(points[s.key], lower[s.key], curve)
    }
    categories.forEach((_, i) => {
      const top = Math.min(100, ...visible.map((s) => points[s.key][i].y))
      anchors.push({ x: bands[i].center, y: top })
    })
  }

  return { ...empty, categoryTicks, valueTicks, bands, bars, barKeys, points, lines, areas, anchors, labels: categories }
}

/** The row index under a point of the plot, given the plot's size, or null when it is outside. */
function indexAt(layout: ChartLayout, input: Pick<Inputs, "type" | "orientation">, x: number, y: number, width: number, height: number): number | null {
  const n = layout.categories.length
  if (!n || width <= 0 || height <= 0) return null
  if (layout.radial) {
    const side = Math.min(width, height)
    const vx = ((x - (width - side) / 2) / side) * 100 - 50
    const vy = ((y - (height - side) / 2) / side) * 100 - 50
    const distance = Math.hypot(vx, vy)
    const { radius, width: ring } = layout.ring
    if (distance < radius - ring / 2 - 3 || distance > radius + ring / 2 + 4) return null
    const at = (((Math.atan2(vy, vx) + Math.PI / 2) / (Math.PI * 2)) * 100 + 100) % 100
    const hit = layout.sliceKeys.find((key) => {
      const s = layout.slices[key]
      return !s.hidden && s.length > 0 && at >= s.start - 1 && at <= s.start + s.length + 1
    })
    return hit === undefined ? null : layout.slices[hit].index
  }
  const along = input.type === "bar" && input.orientation === "horizontal" ? (y / height) * 100 : (x / width) * 100
  let best = 0
  for (let i = 1; i < n; i++) if (Math.abs(layout.bands[i].center - along) < Math.abs(layout.bands[best].center - along)) best = i
  return best
}

/* ---------------------------------------------------------------- the primitive */

const keyCount = (layout: ChartLayout) => layout.categories.length

const chart = definePrimitive({
  name: "chart",
  options: {
    data: "value",
    config: "value",
    categoryKey: "string",
    type: "string",
    stacked: "boolean",
    orientation: "string",
    curve: "string",
    categoryGap: "number",
    innerRadius: "number",
    padAngle: "number",
    dots: "boolean",
    formatValue: "value",
    formatTick: "value",
    formatCategory: "value",
    activeIndex: "value",
    defaultActiveIndex: "value",
    onActiveIndexChange: "callback",
    hiddenSeries: "list",
    defaultHiddenSeries: "list",
    onHiddenSeriesChange: "callback",
  },
  controlled: ["activeIndex", "hiddenSeries"],
  state: (options: ChartOptions): ChartState => {
    const inputs: Inputs = { ...inputsOf(options), hiddenSeries: options.hiddenSeries ?? options.defaultHiddenSeries ?? emptyList, width: 0, height: 0 }
    const activeIndex = options.activeIndex ?? options.defaultActiveIndex ?? null
    return { ...inputs, activeIndex, lastIndex: activeIndex, focused: null, layout: chartLayout(inputs) }
  },
  sync: (options) => ({
    ...inputsOf(options),
    ...(options.activeIndex === undefined ? {} : { activeIndex: options.activeIndex }),
    ...(options.hiddenSeries === undefined ? {} : { hiddenSeries: options.hiddenSeries }),
  }),
  api: (context) => {
    const { store } = context
    const change = createChange(context)

    /* The layout is derived from the inputs and the hidden series, which a parent may control.
       Recompute it whenever any of them is a new value. */
    const inputKeys = ["data", "config", "categoryKey", "type", "stacked", "orientation", "curve", "categoryGap", "innerRadius", "padAngle", "dots", "formatTick", "formatCategory", "hiddenSeries", "width", "height"] as const
    let from = store.get()
    context.onDestroy(
      store.subscribe(() => {
        const now = store.get()
        if (now.activeIndex !== null && now.activeIndex !== now.lastIndex) store.set({ lastIndex: now.activeIndex })
        if (inputKeys.every((key) => now[key] === from[key])) return
        const layout = chartLayout(now)
        from = { ...now, layout }
        store.set({ layout })
        /* A point past the end of new data is no longer there to be active. */
        if (now.activeIndex !== null && now.activeIndex >= keyCount(layout)) store.set({ activeIndex: null })
        if (now.lastIndex !== null && now.lastIndex >= keyCount(layout)) store.set({ lastIndex: null })
      }),
    )

    const roving = createRovingFocus<ChartState, { value: string }>(context, {
      slot: "point",
      key: "focused",
      orientation: () => {
        const { type, orientation } = store.get()
        return isRadial(type) ? "both" : type === "bar" && orientation === "horizontal" ? "vertical" : "horizontal"
      },
      preferred: (item) => {
        const { activeIndex, layout } = store.get()
        return activeIndex !== null && layout.categories[activeIndex] === item.key
      },
    })

    const setActive = (index: number | null, reason: ActiveReason, event?: Event) => {
      const next = index === null || index < 0 || index >= keyCount(store.get().layout) ? null : index
      if (store.get().activeIndex === next) return false
      return change("activeIndex", next, { reason, event })
    }

    /* Arrow keys move focus first, which would report the change as "focus-in". */
    let navigating = false

    const setHidden = (hidden: string[], event?: Event) => {
      const { layout } = store.get()
      const all = layout.radial ? layout.categories : layout.series.map((s) => s.key)
      const next = all.filter((key) => hidden.includes(key))
      /* Something always stays on the chart. */
      if (all.length && next.length >= all.length) return false
      const now = store.get().hiddenSeries
      if (next.length === now.length && next.every((key, i) => key === now[i])) return false
      return change("hiddenSeries", next, { reason: "item-press", event })
    }

    return {
      roving,
      /** Makes a row active, by index, as if it were hovered. `null` lets go. */
      setActiveIndex: (index: number | null, event?: Event) => setActive(index, "item-press", event),
      /** Makes a row active by its category, like "Mar", or a pie's slice by its name. */
      selectCategory(category: string) {
        return setActive(store.get().layout.categories.indexOf(category), "item-press")
      },
      /** Lets go of the active point. */
      clearActive: () => setActive(null, "item-press"),
      /** Hides a series (a slice for a pie) or shows it again. The last one shown stays. */
      toggleSeries(key: string, event?: Event) {
        const now = store.get().hiddenSeries
        return setHidden(now.includes(key) ? now.filter((k) => k !== key) : [...now, key], event)
      },
      /** Hides exactly these series (slices for a pie). */
      setHiddenSeries: (hidden: string[]) => setHidden(hidden),
      /** The series an agent can toggle, or a pie's slices. */
      legendItems() {
        const { layout } = store.get()
        return layout.radial
          ? layout.sliceKeys.map((key) => ({ value: key, label: layout.slices[key].label }))
          : layout.series.map((s) => ({ value: s.key, label: s.label }))
      },
      /** Records the plot's size, which decides how many ticks and labels fit. */
      measure(width: number, height: number) {
        const w = Math.round(width)
        const h = Math.round(height)
        const now = store.get()
        if (w !== now.width || h !== now.height) store.set({ width: w, height: h })
      },
      pointer(event: PointerEvent, el: HTMLElement) {
        const rect = el.getBoundingClientRect()
        const state = store.get()
        const index = indexAt(state.layout, state, event.clientX - rect.left, event.clientY - rect.top, rect.width, rect.height)
        if (index === null) setActive(null, "pointer-leave", event)
        else setActive(index, "item-hover", event)
      },
      leave: (event: PointerEvent) => setActive(null, "pointer-leave", event),
      keydown(event: KeyboardEvent, el: HTMLElement) {
        if (event.key === "Escape") {
          if (store.get().activeIndex !== null) {
            event.preventDefault()
            setActive(null, "escape-key", event)
          }
          return
        }
        navigating = true
        const moved = roving.keydown(event, el)
        navigating = false
        if (moved) setActive(store.get().layout.categories.indexOf(moved.key), "list-navigation", event)
      },
      focusPoint(key: string, event: FocusEvent) {
        if (!navigating) setActive(store.get().layout.categories.indexOf(key), "focus-in", event)
      },
      pressPoint: (key: string, event?: Event) => setActive(store.get().layout.categories.indexOf(key), "item-press", event),
      blurPoints: (event: FocusEvent) => setActive(null, "focus-out", event),
    }
  },
  slots: (slot) => {
    /* What the tooltip and a point's name say about one row. */
    const readout = (state: ChartState, index: number) => {
      const { layout } = state
      if (layout.radial) {
        const slice = layout.slices[layout.sliceKeys[index]]
        const series = layout.series[0]
        return slice
          ? [{ key: slice.category, label: slice.label, value: slice.value, text: state.formatValue(slice.value, series.key), color: slice.color, share: slice.share }]
          : []
      }
      const row = state.data[index]
      return layout.series
        .filter((s) => !s.hidden)
        .map((s) => {
          const value = numberOf(row, s.key)
          return { key: s.key, label: s.label, value, text: state.formatValue(value, s.key), color: s.color, share: 0 }
        })
    }
    /* A stack's total, for the tooltip and the point names: stacked bars or areas with more than one series shown. */
    const totalOf = (state: ChartState, index: number) => {
      const rows = readout(state, index)
      if (!state.stacked || state.type === "line" || state.layout.radial || rows.length < 2) return null
      const value = rows.reduce((sum, r) => sum + r.value, 0)
      return { value, text: state.formatValue(value, "total") }
    }
    const nameOf = (state: ChartState, index: number) => {
      const { layout } = state
      const title = layout.radial ? (layout.slices[layout.sliceKeys[index]]?.label ?? "") : (layout.labels[index] ?? "")
      const parts = readout(state, index).map((r) => (layout.radial ? `${r.text}, ${Math.round(r.share * 100)}%` : `${r.label} ${r.text}`))
      const total = totalOf(state, index)
      return `${title}: ${parts.join(", ")}${total ? `, total ${total.text}` : ""}`
    }
    /* Where the cursor, tooltip and markers sit: the active row, or the one they are leaving. */
    const shownIndex = (state: ChartState) => state.activeIndex ?? state.lastIndex
    const anchorStyle = (state: ChartState) => {
      const index = shownIndex(state)
      const anchor = index === null ? null : state.layout.anchors[index]
      return anchor ? css({ "--chart-x": pct(anchor.x), "--chart-y": pct(anchor.y) }) : undefined
    }
    const gradientId = (id: string, key: string) => `${id.replace(/[^\w-]/g, "")}-fill-${cssName(key)}`
    const cartesian = (state: ChartState) => !isRadial(state.type)
    const across = (state: ChartState) => state.type === "bar" && state.orientation === "horizontal"
    const axisTicks = (state: ChartState, axis: string) =>
      (axis === "x") === across(state) ? state.layout.valueTicks : state.layout.categoryTicks
    const tickOf = (state: ChartState, key: string, axis: string) => axisTicks(state, axis).find((t) => t.key === key)

    return {
      /* A figure. Name it with `aria-label` or `aria-labelledby` on the root. Each series' colour
         goes out as `--color-<key>`, as shadcn's charts do, so your own CSS can use them too. */
      root: slot<{}, { type: ChartType; orientation: ChartOrientation; stacked: boolean; active: boolean; radial: boolean; series: ChartSeries[] }>({
        role: "figure",
        state: (state) => ({
          type: state.type,
          orientation: state.orientation,
          stacked: state.stacked,
          active: state.activeIndex !== null,
          radial: state.layout.radial,
          series: state.layout.series,
        }),
        attrs: (state) => {
          /* The palette goes round in series order (slice order for a pie), so a config entry
             that only labels the category, like `month: { label: "Month" }`, takes no colour. */
          const colors: Record<string, string> = {}
          const keys = state.layout.radial ? state.layout.sliceKeys : state.layout.series.map((s) => s.key)
          keys.forEach((key, i) => {
            colors[`--color-${cssName(key)}`] = state.config[key]?.color ?? `var(--chart-${(i % 5) + 1})`
          })
          return {
            "data-type": state.type,
            "data-orientation": state.orientation,
            "data-stacked": state.stacked && state.type !== "line" ? "" : undefined,
            "data-active": state.activeIndex !== null ? "" : undefined,
            style: css(colors),
          }
        },
      }),

      /* The marks' box. It measures itself, so ticks and labels thin out to fit, and hears the
         pointer, which makes the row under it active. */
      plot: slot<{}, { radial: boolean }>({
        state: (state) => ({ radial: state.layout.radial }),
        attrs: (state) => ({ "data-type": state.type, "data-orientation": state.orientation }),
        on: {
          pointermove: (event, { el, api }) => {
            if (el) api.pointer(event as PointerEvent, el)
          },
          pointerleave: (event, { el, api }) => {
            const related = (event as PointerEvent).relatedTarget as Node | null
            if (!el || !related || !el.contains(related)) api.leave(event as PointerEvent)
          },
        },
        bind: (el, part) => {
          const measure = () => part.api.measure(el.clientWidth, el.clientHeight)
          measure()
          const observer = new ResizeObserver(measure)
          observer.observe(el)
          return () => observer.disconnect()
        },
      }),

      /* Horizontal rules at the value ticks (vertical ones for horizontal bars). */
      grid: slot<{}, { ticks: string[] }>({
        present: cartesian,
        state: (state) => ({ ticks: state.layout.valueTicks.map((t) => t.key) }),
        attrs: () => ({ "aria-hidden": "true" }),
      }),
      "grid-line": slot<{ value: string }>({
        props: { value: "string" },
        present: cartesian,
        attrs: (state, part) => {
          const tick = state.layout.valueTicks.find((t) => t.key === part.key)
          /* From the top for horizontal rules, from the left for vertical ones. */
          const across = state.type === "bar" && state.orientation === "horizontal"
          const pos = tick ? (across ? tick.pos : 100 - tick.pos) : 0
          return { "data-zero": tick?.zero ? "" : undefined, style: css({ "--chart-pos": pct(pos) }) }
        },
      }),

      /* The axis along the bottom and the one up the side. Each shows whichever dimension sits there. */
      "x-axis": slot<{}, { ticks: ChartTick[] }>({
        present: cartesian,
        state: (state) => ({ ticks: axisTicks(state, "x") }),
        attrs: () => ({ "aria-hidden": "true" }),
      }),
      "y-axis": slot<{}, { ticks: ChartTick[] }>({
        present: cartesian,
        state: (state) => ({ ticks: axisTicks(state, "y") }),
        attrs: () => ({ "aria-hidden": "true" }),
      }),
      /* One label on an axis. `--chart-pos` is its place from the axis' start: the left of the
         bottom axis, the top of the side axis. */
      tick: slot<{ value: string; axis: string }, { label: string; shown: boolean }>({
        props: { value: "string", axis: "string" },
        state: (state, part) => {
          const tick = tickOf(state, part.key, part.props.axis)
          return { label: tick?.label ?? "", shown: tick?.shown ?? false }
        },
        attrs: (state, part) => {
          const tick = tickOf(state, part.key, part.props.axis)
          const isValue = tick ? state.layout.valueTicks.includes(tick) : false
          const pos = tick ? (part.props.axis === "y" && isValue ? 100 - tick.pos : tick.pos) : 0
          return { "data-hidden": tick && !tick.shown ? "" : undefined, "data-axis": part.props.axis, style: css({ "--chart-pos": pct(pos) }) }
        },
      }),

      /* The band (bars) or hairline (lines and areas) behind the active row. */
      cursor: slot({
        present: cartesian,
        attrs: (state) => {
          const index = shownIndex(state)
          const band = index === null ? undefined : state.layout.bands[index]
          return {
            "aria-hidden": "true",
            "data-open": state.activeIndex !== null ? "" : undefined,
            style: band ? css({ "--chart-x": pct(band.start), "--chart-w": pct(band.size), "--chart-c": pct(band.center) }) : undefined,
          }
        },
      }),

      /* The marks: one part per bar, per line, per area, per dot and per slice. */
      marks: slot<{}, { barKeys: string[]; series: ChartSeries[]; sliceKeys: string[]; categories: string[]; dots: boolean; ring: { radius: number; width: number } }>({
        state: (state) => ({
          barKeys: state.type === "bar" ? state.layout.barKeys : [],
          series: state.layout.series,
          sliceKeys: state.layout.radial ? state.layout.sliceKeys : [],
          categories: state.layout.categories,
          dots: state.dots,
          ring: state.layout.ring,
        }),
        attrs: () => ({ "aria-hidden": "true" }),
      }),
      /* The drawing surface for lines, areas and rings: a 0–100 box. Lines and areas stretch to the
         plot (their strokes don't); a ring keeps its shape in the middle. */
      svg: slot({
        present: (state) => state.type !== "bar",
        attrs: (state) => ({
          "aria-hidden": "true",
          viewBox: "0 0 100 100",
          preserveAspectRatio: state.layout.radial ? "xMidYMid meet" : "none",
          focusable: "false",
        }),
      }),
      /* A vertical fade under an area, in the series' colour. */
      gradient: slot<{ value: string }>({
        props: { value: "string" },
        attrs: (state, part) => ({
          id: gradientId(part.id, part.key),
          x1: "0",
          y1: "0",
          x2: "0",
          y2: "1",
          style: css({ "--chart-color": state.layout.series.find((s) => s.key === part.key)?.color }),
        }),
      }),
      bar: slot<{ value: string }>({
        props: { value: "string" },
        attrs: (state, part) => {
          const bar = state.layout.bars[part.key]
          if (!bar) return { "data-hidden": "" }
          return {
            "data-series": bar.series,
            "data-start": bar.start ? "" : undefined,
            "data-end": bar.end ? "" : undefined,
            "data-negative": bar.negative ? "" : undefined,
            "data-hidden": bar.hidden ? "" : undefined,
            "data-active": state.activeIndex === bar.index ? "" : undefined,
            style: css({
              "--chart-x": bar.x,
              "--chart-w": bar.w,
              "--chart-y": bar.y,
              "--chart-h": bar.h,
              "--chart-i": bar.index,
              "--chart-s": bar.stack,
              "--chart-color": `var(--color-${cssName(bar.series)})`,
            }),
          }
        },
      }),
      line: slot<{ value: string }>({
        props: { value: "string" },
        attrs: (state, part) => {
          const series = state.layout.series.find((s) => s.key === part.key)
          return {
            "data-series": part.key,
            "data-hidden": series?.hidden ? "" : undefined,
            d: state.layout.lines[part.key] ?? "",
            style: css({ "--chart-path": `path('${state.layout.lines[part.key] ?? ""}')`, "--chart-color": series?.color, "--chart-i": series?.index }),
          }
        },
      }),
      area: slot<{ value: string }>({
        props: { value: "string" },
        attrs: (state, part) => {
          const series = state.layout.series.find((s) => s.key === part.key)
          return {
            "data-series": part.key,
            "data-hidden": series?.hidden ? "" : undefined,
            d: state.layout.areas[part.key] ?? "",
            fill: `url(#${gradientId(part.id, part.key)})`,
            style: css({ "--chart-path": `path('${state.layout.areas[part.key] ?? ""}')`, "--chart-color": series?.color, "--chart-i": series?.index }),
          }
        },
      }),
      /* A dot on a line's point: always there, shown by `dots` or while its row is active. */
      dot: slot<{ value: string }>({
        props: { value: "string" },
        attrs: (state, part) => {
          const [key, category] = part.key.split("\u001f")
          const index = state.layout.categories.indexOf(category)
          const point = state.layout.points[key]?.[index]
          const series = state.layout.series.find((s) => s.key === key)
          return {
            "data-series": key,
            "data-hidden": series?.hidden ? "" : undefined,
            "data-active": state.activeIndex === index ? "" : undefined,
            "data-shown": state.dots ? "" : undefined,
            style: css({ "--chart-x": point?.x ?? 0, "--chart-y": point?.y ?? 0, "--chart-i": index, "--chart-color": series?.color }),
          }
        },
      }),
      slice: slot<{ value: string }>({
        props: { value: "string" },
        attrs: (state, part) => {
          const slice = state.layout.slices[part.key]
          if (!slice) return { "data-hidden": "" }
          return {
            cx: "50",
            cy: "50",
            r: String(state.layout.ring.radius),
            pathLength: "100",
            "data-hidden": slice.hidden ? "" : undefined,
            "data-active": state.activeIndex === slice.index ? "" : undefined,
            style: css({
              "--chart-len": slice.length,
              "--chart-offset": -slice.start,
              "--chart-ring": state.layout.ring.width,
              "--chart-i": slice.index,
              "--chart-color": slice.color,
            }),
          }
        },
      }),

      /* What a donut shows in its hole: the active slice, or the total. */
      center: slot<{}, { label: string | null; value: number; text: string; share: number | null }>({
        present: (state) => state.layout.radial && state.innerRadius >= 0.4,
        state: (state) => {
          const slice = state.activeIndex === null ? undefined : state.layout.slices[state.layout.sliceKeys[state.activeIndex]]
          const key = state.layout.series[0]?.key ?? "value"
          return slice
            ? { label: slice.label, value: slice.value, text: state.formatValue(slice.value, key), share: slice.share }
            : { label: null, value: state.layout.total, text: state.formatValue(state.layout.total, key), share: null }
        },
        attrs: (state) => ({ "aria-hidden": "true", "data-active": state.activeIndex !== null ? "" : undefined }),
      }),

      /* The points, one tab stop with arrow keys between them. Each is named with its values,
         so a screen reader reads the chart point by point. */
      points: slot<{}, { categories: string[] }>({
        role: "listbox",
        keys: { none: "Each point moves focus with the arrow keys itself, through roving focus." },
        state: (state) => ({ categories: state.layout.categories }),
        attrs: (state) => ({
          "aria-label": "Data points",
          "aria-orientation": isRadial(state.type) ? undefined : state.type === "bar" && state.orientation === "horizontal" ? "vertical" : "horizontal",
        }),
        on: {
          focusout: (event, { el, api }) => {
            const next = (event as FocusEvent).relatedTarget as Node | null
            if (el && (!next || !el.contains(next))) api.blurPoints(event as FocusEvent)
          },
        },
      }),
      point: slot<{ value: string }, { active: boolean; index: number }>({
        role: "option",
        focus: "roving",
        props: { value: "string" },
        state: (state, part) => {
          const index = state.layout.categories.indexOf(part.key)
          return { active: index === state.activeIndex, index }
        },
        attrs: (state, part) => {
          const index = state.layout.categories.indexOf(part.key)
          const band = state.layout.bands[index]
          const mid = state.layout.radial ? state.layout.slices[part.key]?.mid : undefined
          return {
            "aria-selected": String(index === state.activeIndex),
            "aria-label": nameOf(state, index),
            tabindex: part.api.roving.tabIndex(state, part),
            "data-index": String(index),
            "data-active": index === state.activeIndex ? "" : undefined,
            style: mid ? css({ "--chart-x": pct(mid.x), "--chart-y": pct(mid.y) }) : band ? css({ "--chart-x": pct(band.start), "--chart-w": pct(band.size) }) : undefined,
          }
        },
        press: ({ api, key }, event) => {
          api.pressPoint(key, event)
        },
        on: {
          keydown: (event, { el, api }) => {
            if (el) api.keydown(event as KeyboardEvent, el)
          },
          focus: (event, { key, api }) => api.focusPoint(key, event as FocusEvent),
        },
        bind: (el, part) => part.api.roving.bind(el, part),
      }),

      /* Follows the active row. Its words are for the eye; the points carry them for screen readers. */
      tooltip: slot<{}, { open: boolean; title: string; rows: ReturnType<typeof readout>; total: { value: number; text: string } | null }>({
        state: (state) => {
          const index = shownIndex(state)
          if (index === null) return { open: false, title: "", rows: [], total: null }
          const title = state.layout.radial ? state.layout.series[0]?.label ?? "" : state.layout.labels[index] ?? ""
          return { open: state.activeIndex !== null, title, rows: readout(state, index), total: totalOf(state, index) }
        },
        attrs: (state) => {
          const index = shownIndex(state)
          const anchor = index === null ? undefined : state.layout.anchors[index]
          /* Away from the centre on a ring; towards the middle near a cartesian chart's right edge. */
          const left = anchor !== undefined && (state.layout.radial ? anchor.x < 50 : anchor.x > 58)
          /* Beside a bar group's band rather than over it. */
          const band = index !== null && state.type === "bar" && !across(state) ? state.layout.bands[index] : undefined
          const off = band ? ((band.size * (1 - state.categoryGap)) / 2) * (left ? -1 : 1) : 0
          return {
            "aria-hidden": "true",
            "data-open": state.activeIndex !== null ? "" : undefined,
            "data-side": left ? "left" : "right",
            style: anchor ? css({ "--chart-x": pct(anchor.x + off), "--chart-y": pct(anchor.y) }) : undefined,
          }
        },
      }),
      "tooltip-label": slot({}),
      /* The stack's total under the rows, when bars or areas are stacked. */
      "tooltip-total": slot({}),
      /* One row of the tooltip: a series, or a pie's slice. */
      "tooltip-item": slot<{ value: string }>({
        props: { value: "string" },
        attrs: (state, part) => {
          const series = state.layout.series.find((s) => s.key === part.key)
          const color = state.layout.radial ? state.layout.slices[part.key]?.color : series?.color
          return { "data-series": part.key, style: css({ "--chart-color": color }) }
        },
      }),

      /* A dot per series that rides to the active point of a line or area. */
      marker: slot<{ value: string }>({
        props: { value: "string" },
        attrs: (state, part) => {
          const series = state.layout.series.find((s) => s.key === part.key)
          const index = shownIndex(state)
          const point = index === null ? undefined : state.layout.points[part.key]?.[index]
          return {
            "aria-hidden": "true",
            "data-open": point && state.activeIndex !== null && !series?.hidden ? "" : undefined,
            style: point ? css({ "--chart-x": point.x, "--chart-y": point.y, "--chart-color": series?.color }) : css({ "--chart-color": series?.color }),
          }
        },
      }),

      /* Toggles for the series (a pie's slices). Pressed means shown. */
      legend: slot<{}, { items: { value: string; label: string }[] }>({
        role: "group",
        state: (state) => ({
          items: state.layout.radial
            ? state.layout.sliceKeys.map((key) => ({ value: key, label: state.layout.slices[key].label }))
            : state.layout.series.map((s) => ({ value: s.key, label: s.label })),
        }),
        attrs: () => ({ "aria-label": "Series" }),
      }),
      "legend-item": slot<{ value: string }, { hidden: boolean; label: string }>({
        props: { value: "string" },
        state: (state, part) => ({
          hidden: state.hiddenSeries.includes(part.key),
          label: state.layout.radial ? (state.layout.slices[part.key]?.label ?? part.key) : (state.layout.series.find((s) => s.key === part.key)?.label ?? part.key),
        }),
        attrs: (state, part) => {
          const color = state.layout.radial ? state.layout.slices[part.key]?.color : state.layout.series.find((s) => s.key === part.key)?.color
          return {
            type: "button",
            "data-series": part.key,
            "aria-pressed": String(!state.hiddenSeries.includes(part.key)),
            "data-hidden": state.hiddenSeries.includes(part.key) ? "" : undefined,
            style: css({ "--chart-color": color }),
          }
        },
        press: ({ api, key }, event) => api.toggleSeries(key, event),
      }),

      /* The same numbers as a table, for screen readers. Hide it visually. */
      table: slot<{}, { head: string[]; rows: { key: string; cells: string[] }[] }>({
        state: (state) => {
          const { layout } = state
          if (layout.radial) {
            const key = layout.series[0]?.key ?? "value"
            return {
              head: [state.config[state.categoryKey]?.label ?? state.categoryKey, layout.series[0]?.label ?? key],
              rows: layout.sliceKeys.map((c) => ({ key: c, cells: [layout.slices[c].label, state.formatValue(numberOf(state.data[layout.slices[c].index], key), key)] })),
            }
          }
          return {
            head: [state.config[state.categoryKey]?.label ?? state.categoryKey, ...layout.series.map((s) => s.label)],
            rows: layout.categories.map((c, i) => ({ key: c, cells: [layout.labels[i], ...layout.series.map((s) => state.formatValue(numberOf(state.data[i], s.key), s.key))] })),
          }
        },
      }),
    }
  },
  agent: {
    actions: ["selectCategory", "clearActive", "toggleSeries", "setHiddenSeries"],
    items: (api) => api.legendItems(),
  },
})

export {
  areaPath,
  chart,
  type ChartBar,
  type ChartCategoryFormatter,
  type ChartConfig,
  type ChartCurve,
  type ChartDatum,
  chartLayout,
  type ChartLayout,
  type ChartOptions,
  type ChartOrientation,
  type ChartSeries,
  type ChartSeriesConfig,
  type ChartSlice,
  type ChartState,
  type ChartTick,
  type ChartTickFormatter,
  type ChartType,
  type ChartValueFormatter,
  indexAt,
  linearPath,
  linearScale,
  linePath,
  monotonePath,
  niceTicks,
  ringPoint,
  ringSlices,
  stackSeries,
}
