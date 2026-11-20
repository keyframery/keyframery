/* A sparkline, as a UI SDK primitive. UI SDK ships no sparkline, so it is defined with its core: the
   same definition renders in React, Vue, Svelte, Solid and web components.

   A word-sized trend: a line, an area or a row of bars drawn from a plain list of numbers, with its
   last point marked. It follows `chart`'s conventions: geometry goes out as CSS variables in percent
   of the plot (and as SVG paths in a 0–100 box), so it lays out on the server and CSS tweens every
   change; one tab stop over the points, arrow keys, Home and End; names for every point.

     <Sparkline data={[12, 14, 13, 18, 21]} label="Revenue" period="last 14 days" />

   Its trend (up, down or flat, first point to last) and its change in percent are state, so the
   styled part can colour by trend and an agent can read them. `downIsGood` turns the meaning round
   for numbers that should fall, like refunds.

   Every line and area path is built from the same number of cubic segments (96) whatever the number
   of points, by splitting each real segment exactly. So a 7-day line tweens into a 30-day or 90-day
   one instead of jumping. */

import { type ChangeDetails, createChange, createRovingFocus, css, definePrimitive } from "@ui-sdk/core"

/* ---------------------------------------------------------------- types */

type SparklineType = "line" | "area" | "bar"
type SparklineCurve = "smooth" | "linear"
type SparklineTrend = "up" | "down" | "flat"
/** Whether the trend is good news: `positive`, `negative`, or `neutral` when it is flat. */
type SparklineTone = "positive" | "negative" | "neutral"
type SparklineValueFormatter = (value: number) => string

type ActiveReason = "item-hover" | "item-press" | "list-navigation" | "focus-in" | "focus-out" | "escape-key" | "pointer-leave"

type SparklineOptions = {
  /** The numbers, oldest first. */
  data?: number[]
  /** A name for each point, like "Nov 12", for the readout and the point names. */
  labels?: string[]
  /** `line` (the default), `area` or `bar`. */
  type?: SparklineType
  /** `smooth` (the default, never overshooting a point) or `linear`. */
  curve?: SparklineCurve
  /** What it measures, like "Revenue". Starts the accessible summary. */
  label?: string
  /** The span it covers, like "last 14 days". Goes in the accessible summary. */
  period?: string
  /** Formats a value for the readout and the point names. */
  formatValue?: SparklineValueFormatter
  /** A fall is good news (refunds, churn, response time): the tone turns round. */
  downIsGood?: boolean
  /** A change smaller than this share of the first value counts as flat. Defaults to 0.01 (1%). */
  flatThreshold?: number
  /** A value to draw a dashed line at: a target, a budget, last period's average. */
  reference?: number | null
  /** Marks the highest and the lowest point. */
  extremes?: boolean
  /** Keeps zero in the value range. Defaults to true for bars, false for lines and areas. */
  includeZero?: boolean
  /** The point (index) under the pointer or the keyboard, controlled. `null` for none. */
  activeIndex?: number | null
  defaultActiveIndex?: number | null
  onActiveIndexChange?: (index: number | null, details: ChangeDetails<ActiveReason>) => void
}

type Inputs = {
  values: number[]
  labels: string[]
  type: SparklineType
  curve: SparklineCurve
  label: string
  period: string
  formatValue: SparklineValueFormatter
  downIsGood: boolean
  flatThreshold: number
  reference: number | null
  extremes: boolean
  includeZero: boolean
}

type Point = { x: number; y: number }
type SparklineBar = { index: number; x: number; w: number; y: number; h: number; negative: boolean }

type SparklineLayout = {
  points: Point[]
  line: string
  area: string
  bars: SparklineBar[]
  /** The baseline (bars and areas grow from it), in percent from the top. */
  base: number
  /** The reference line, in percent from the top, or null. */
  referenceY: number | null
  minIndex: number
  maxIndex: number
  /** Each point's band across the plot, in percent: where the pointer picks it. */
  bands: { start: number; size: number }[]
}

type SparklineState = Inputs & {
  activeIndex: number | null
  /** The point that was active last: the readout fades out where it was. */
  lastIndex: number | null
  focused: string | null
  trend: SparklineTrend
  /** The change from the first point to the last, as a share of the first: 0.12 is up 12%. */
  change: number
  tone: SparklineTone
  /** "Revenue, last 14 days, up 12%". */
  summary: string
  layout: SparklineLayout
}

/* ---------------------------------------------------------------- defaults */

const groupFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 })
const defaultFormat: SparklineValueFormatter = (value) => groupFormat.format(value)
const emptyNumbers: number[] = []
const emptyLabels: string[] = []

const round = (value: number) => Math.round(value * 100) / 100
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const finite = (value: unknown) => (typeof value === "number" && Number.isFinite(value) ? value : 0)

function inputsOf(options: SparklineOptions): Inputs {
  const type = options.type ?? "line"
  return {
    values: options.data ? options.data.map(finite) : emptyNumbers,
    labels: options.labels ?? emptyLabels,
    type,
    curve: options.curve ?? "smooth",
    label: options.label ?? "",
    period: options.period ?? "",
    formatValue: options.formatValue ?? defaultFormat,
    downIsGood: options.downIsGood ?? false,
    flatThreshold: clamp(options.flatThreshold ?? 0.01, 0, 1),
    reference: typeof options.reference === "number" && Number.isFinite(options.reference) ? options.reference : null,
    extremes: options.extremes ?? false,
    includeZero: options.includeZero ?? type === "bar",
  }
}

/* ---------------------------------------------------------------- math */

/** The number of cubic segments every path is built from, so any two paths tween. */
const SEGMENTS = 96

type Cubic = [Point, Point, Point, Point]

/* Monotone tangents (Fritsch–Carlson, as d3's curveMonotoneX), so a value never looks higher than it was. */
function tangents(points: Point[]) {
  const n = points.length
  const t = new Array<number>(n).fill(0)
  if (n < 2) return t
  const slope = (a: Point, b: Point) => (b.y - a.y) / (b.x - a.x || 1)
  for (let i = 1; i < n - 1; i++) {
    const s0 = slope(points[i - 1], points[i])
    const s1 = slope(points[i], points[i + 1])
    const h0 = points[i].x - points[i - 1].x
    const h1 = points[i + 1].x - points[i].x
    const p = (s0 * h1 + s1 * h0) / (h0 + h1 || 1)
    t[i] = (Math.sign(s0) + Math.sign(s1)) * Math.min(Math.abs(s0), Math.abs(s1), 0.5 * Math.abs(p)) || 0
  }
  const end = (a: Point, b: Point, inner: number) => {
    const h = b.x - a.x
    return h ? ((3 * (b.y - a.y)) / h - inner) / 2 : inner
  }
  t[0] = n > 2 ? end(points[0], points[1], t[1]) : slope(points[0], points[1])
  t[n - 1] = n > 2 ? end(points[n - 1], points[n - 2], t[n - 2]) : t[0]
  return t
}

function cubicsOf(points: Point[], curve: SparklineCurve): Cubic[] {
  const t = curve === "smooth" ? tangents(points) : []
  const out: Cubic[] = []
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i]
    const b = points[i + 1]
    const dx = (b.x - a.x) / 3
    out.push(
      curve === "smooth"
        ? [a, { x: a.x + dx, y: a.y + dx * t[i] }, { x: b.x - dx, y: b.y - dx * t[i + 1] }, b]
        : [a, { x: a.x + dx, y: a.y + (b.y - a.y) / 3 }, { x: b.x - dx, y: b.y - (b.y - a.y) / 3 }, b],
    )
  }
  return out
}

const lerp = (a: Point, b: Point, t: number): Point => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t })

/** Splits a cubic at `t` into two that draw exactly the same curve (de Casteljau). */
function split([p0, p1, p2, p3]: Cubic, t: number): [Cubic, Cubic] {
  const a = lerp(p0, p1, t)
  const b = lerp(p1, p2, t)
  const c = lerp(p2, p3, t)
  const d = lerp(a, b, t)
  const e = lerp(b, c, t)
  const f = lerp(d, e, t)
  return [
    [p0, a, d, f],
    [f, e, c, p3],
  ]
}

/** The same curve as `cubics`, cut into exactly `count` segments when it has no more than that. */
function resample(cubics: Cubic[], count: number): Cubic[] {
  if (!cubics.length || cubics.length >= count) return cubics
  const each = Math.floor(count / cubics.length)
  const extra = count % cubics.length
  const out: Cubic[] = []
  cubics.forEach((cubic, i) => {
    let rest = cubic
    for (let k = i < extra ? each + 1 : each; k > 1; k--) {
      const [head, tail] = split(rest, 1 / k)
      out.push(head)
      rest = tail
    }
    out.push(rest)
  })
  return out
}

const pt = (p: Point) => `${round(p.x)},${round(p.y)}`

/** The line through the points as an SVG path of `M` and 96 `C`s (more when there are more points). */
function sparklinePath(points: Point[], curve: SparklineCurve) {
  if (!points.length) return ""
  const through = points.length === 1 ? [{ x: 0, y: points[0].y }, { x: 100, y: points[0].y }] : points
  const cubics = resample(cubicsOf(through, curve), SEGMENTS)
  return `M${pt(cubics[0][0])}` + cubics.map((c) => `C${pt(c[1])},${pt(c[2])},${pt(c[3])}`).join("")
}

/** The change from the first value to the last, as a share of the first, and what it means. */
function trendOf(values: number[], flatThreshold: number, downIsGood: boolean) {
  const first = values[0] ?? 0
  const last = values.at(-1) ?? 0
  const change = values.length < 2 ? 0 : first !== 0 ? (last - first) / Math.abs(first) : last === 0 ? 0 : Math.sign(last)
  const trend: SparklineTrend = Math.abs(change) <= flatThreshold ? "flat" : change > 0 ? "up" : "down"
  const tone: SparklineTone = trend === "flat" ? "neutral" : (trend === "up") !== downIsGood ? "positive" : "negative"
  return { change, trend, tone }
}

/** "12%", or "4.2%" under ten. */
function percent(share: number) {
  const value = Math.abs(share) * 100
  return `${value < 10 ? Math.round(value * 10) / 10 : Math.round(value)}%`
}

function summaryOf(input: Inputs, trend: SparklineTrend, change: number) {
  const words = trend === "flat" ? "flat" : `${trend} ${percent(change)}`
  return [input.label || "Trend", input.period, input.values.length ? words : "no data"].filter(Boolean).join(", ")
}

function sparklineLayout(input: Inputs): SparklineLayout {
  const { values, type } = input
  const n = values.length
  const empty: SparklineLayout = { points: [], line: "", area: "", bars: [], base: 100, referenceY: null, minIndex: -1, maxIndex: -1, bands: [] }
  if (!n) return empty

  let lo = Math.min(...values)
  let hi = Math.max(...values)
  if (input.reference !== null) {
    lo = Math.min(lo, input.reference)
    hi = Math.max(hi, input.reference)
  }
  if (input.includeZero) {
    lo = Math.min(lo, 0)
    hi = Math.max(hi, 0)
  }
  if (hi === lo) {
    hi += 1
    lo -= 1
  }
  /* A line keeps some air under its lowest point, so it never runs along the floor. */
  if (type !== "bar" && !input.includeZero) lo -= (hi - lo) * 0.18
  /* y in percent from the top. */
  const y = (value: number) => round(100 - ((value - lo) / (hi - lo)) * 100)
  const base = input.includeZero ? y(0) : 100

  let minIndex = 0
  let maxIndex = 0
  values.forEach((v, i) => {
    if (v < values[minIndex]) minIndex = i
    if (v > values[maxIndex]) maxIndex = i
  })

  if (type === "bar") {
    const size = 100 / n
    const gap = n > 1 ? 0.3 : 0
    const bars = values.map((v, i) => {
      const top = Math.min(y(v), base)
      const bottom = Math.max(y(v), base)
      return { index: i, x: round(i * size + (size * gap) / 2), w: round(size * (1 - gap)), y: round(100 - bottom), h: round(bottom - top), negative: v < 0 }
    })
    const points = values.map((v, i) => ({ x: round((i + 0.5) * size), y: y(v) }))
    return { ...empty, points, bars, base, referenceY: input.reference === null ? null : y(input.reference), minIndex, maxIndex, bands: values.map((_, i) => ({ start: round(i * size), size: round(size) })) }
  }

  const points = values.map((v, i) => ({ x: n > 1 ? round((i / (n - 1)) * 100) : 100, y: y(v) }))
  const line = sparklinePath(points, input.curve)
  const area = line ? `${line}L100,${base}L0,${base}Z` : ""
  const step = n > 1 ? 100 / (n - 1) : 100
  const bands = points.map((p) => ({ start: round(clamp(p.x - step / 2, 0, 100)), size: round(Math.min(100, p.x + step / 2) - clamp(p.x - step / 2, 0, 100)) }))
  return { points, line, area, bars: [], base, referenceY: input.reference === null ? null : y(input.reference), minIndex, maxIndex, bands }
}

function derived(input: Inputs) {
  const { change, trend, tone } = trendOf(input.values, input.flatThreshold, input.downIsGood)
  return { change: Number(change.toFixed(4)), trend, tone, summary: summaryOf(input, trend, change), layout: sparklineLayout(input) }
}

/* ---------------------------------------------------------------- the primitive */

const keyOf = (index: number) => String(index)

const sparkline = definePrimitive({
  name: "sparkline",
  options: {
    data: "list",
    labels: "list",
    type: "string",
    curve: "string",
    label: "string",
    period: "string",
    formatValue: "value",
    downIsGood: "boolean",
    flatThreshold: "number",
    reference: "value",
    extremes: "boolean",
    includeZero: "boolean",
    activeIndex: "value",
    defaultActiveIndex: "value",
    onActiveIndexChange: "callback",
  },
  /* The values, trend, change and summary are read-only: an agent can read them, not set them. */
  controlled: ["activeIndex", "values", "trend", "change", "summary"],
  state: (options: SparklineOptions): SparklineState => {
    const inputs = inputsOf(options)
    const activeIndex = options.activeIndex ?? options.defaultActiveIndex ?? null
    return { ...inputs, ...derived(inputs), activeIndex, lastIndex: activeIndex, focused: null }
  },
  sync: (options) => ({
    ...inputsOf(options),
    ...(options.activeIndex === undefined ? {} : { activeIndex: options.activeIndex }),
  }),
  api: (context) => {
    const { store } = context
    const change = createChange(context)
    const inputKeys = ["values", "labels", "type", "curve", "label", "period", "downIsGood", "flatThreshold", "reference", "extremes", "includeZero"] as const
    const same = (a: unknown, b: unknown) =>
      a === b || (Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((v, i) => v === b[i]))
    let from = store.get()
    context.onDestroy(
      store.subscribe(() => {
        const now = store.get()
        if (now.activeIndex !== null && now.activeIndex !== now.lastIndex) store.set({ lastIndex: now.activeIndex })
        if (inputKeys.every((key) => same(now[key], from[key]))) return
        const next = derived(now)
        from = { ...now, ...next }
        store.set(next)
        const count = now.values.length
        if (now.activeIndex !== null && now.activeIndex >= count) store.set({ activeIndex: null })
        if (now.lastIndex !== null && now.lastIndex >= count) store.set({ lastIndex: null })
      }),
    )

    const roving = createRovingFocus<SparklineState, { value: string }>(context, {
      slot: "point",
      key: "focused",
      orientation: () => "horizontal",
      preferred: (item) => {
        const { activeIndex } = store.get()
        return activeIndex !== null && keyOf(activeIndex) === item.key
      },
    })

    const setActive = (index: number | null, reason: ActiveReason, event?: Event) => {
      const next = index === null || index < 0 || index >= store.get().values.length ? null : index
      if (store.get().activeIndex === next) return false
      return change("activeIndex", next, { reason, event })
    }
    let navigating = false

    return {
      roving,
      /** Shows the value of a point, by index, as if it were hovered. `null` lets go. */
      selectIndex: (index: number | null) => setActive(index, "item-press"),
      /** Shows the last point's value. */
      selectLast: () => setActive(store.get().values.length - 1, "item-press"),
      /** Lets go of the shown point. */
      clearActive: () => setActive(null, "item-press"),
      pointer(event: PointerEvent, el: HTMLElement) {
        const rect = el.getBoundingClientRect()
        const { values, type } = store.get()
        const n = values.length
        if (!n || rect.width <= 0) return
        const at = clamp((event.clientX - rect.left) / rect.width, 0, 1)
        const index = type === "bar" ? Math.min(n - 1, Math.floor(at * n)) : Math.round(at * (n - 1))
        setActive(index, "item-hover", event)
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
        if (moved) setActive(Number(moved.key), "list-navigation", event)
      },
      focusPoint(key: string, event: FocusEvent) {
        if (!navigating) setActive(Number(key), "focus-in", event)
      },
      pressPoint: (key: string, event?: Event) => setActive(Number(key), "item-press", event),
      blurPoints: (event: FocusEvent) => setActive(null, "focus-out", event),
    }
  },
  slots: (slot) => {
    const shownIndex = (state: SparklineState) => state.activeIndex ?? state.lastIndex
    const pointName = (state: SparklineState, index: number) => {
      const value = state.values[index]
      if (value === undefined) return ""
      const name = state.labels[index] ?? `Point ${index + 1} of ${state.values.length}`
      return `${name}: ${state.formatValue(value)}`
    }
    const pointStyle = (point: Point | undefined) => (point ? css({ "--sparkline-x": point.x, "--sparkline-y": point.y }) : undefined)

    return {
      /* A figure named by its summary, unless you name it yourself with `aria-label`. */
      root: slot<{}, { type: SparklineType; trend: SparklineTrend; tone: SparklineTone; change: number; summary: string; active: boolean; empty: boolean }>({
        role: "figure",
        state: (state) => ({
          type: state.type,
          trend: state.trend,
          tone: state.tone,
          change: state.change,
          summary: state.summary,
          active: state.activeIndex !== null,
          empty: state.values.length === 0,
        }),
        attrs: (state) => ({
          "aria-label": state.summary,
          "data-type": state.type,
          "data-trend": state.trend,
          "data-tone": state.tone,
          "data-active": state.activeIndex !== null ? "" : undefined,
          "data-empty": state.values.length ? undefined : "",
        }),
      }),

      /* The marks' box. It hears the pointer: the point under it shows its value. */
      plot: slot<{}, { type: SparklineType; count: number }>({
        state: (state) => ({ type: state.type, count: state.values.length }),
        attrs: (state) => ({ "data-type": state.type }),
        on: {
          pointermove: (event, { el, api }) => {
            if (el) api.pointer(event as PointerEvent, el)
          },
          pointerleave: (event, { api }) => api.leave(event as PointerEvent),
        },
      }),

      /* The drawing surface for the line and area: a 0–100 box stretched to the plot. */
      svg: slot({
        present: (state) => state.type !== "bar",
        attrs: () => ({ "aria-hidden": "true", viewBox: "0 0 100 100", preserveAspectRatio: "none", focusable: "false" }),
      }),
      line: slot({
        present: (state) => state.type !== "bar",
        attrs: (state) => ({ d: state.layout.line, style: css({ "--sparkline-path": `path('${state.layout.line}')` }) }),
      }),
      /* The fill under the line. Give it a `fill` (a gradient's url) of your own. */
      area: slot({
        present: (state) => state.type === "area",
        attrs: (state) => ({ d: state.layout.area, style: css({ "--sparkline-path": `path('${state.layout.area}')` }) }),
      }),
      /* One bar, keyed by its index. */
      bar: slot<{ value: string }>({
        props: { value: "string" },
        attrs: (state, part) => {
          const bar = state.layout.bars[Number(part.key)]
          if (!bar) return { "data-hidden": "" }
          const active = state.activeIndex
          return {
            "data-index": part.key,
            "data-active": active === bar.index ? "" : undefined,
            "data-last": bar.index === state.values.length - 1 ? "" : undefined,
            "data-negative": bar.negative ? "" : undefined,
            "data-dim": active !== null && active !== bar.index ? "" : undefined,
            style: css({ "--sparkline-x": bar.x, "--sparkline-w": bar.w, "--sparkline-y": bar.y, "--sparkline-h": bar.h, "--sparkline-i": bar.index }),
          }
        },
      }),
      /* The dashed line at `reference`. */
      reference: slot({
        present: (state) => state.layout.referenceY !== null,
        attrs: (state) => ({ "aria-hidden": "true", style: css({ "--sparkline-y": state.layout.referenceY ?? 0 }) }),
      }),
      /* The highest ("max") and lowest ("min") point, shown by `extremes`. */
      extreme: slot<{ value: string }>({
        props: { value: "string" },
        present: (state) => state.extremes && state.values.length > 1,
        attrs: (state, part) => {
          const index = part.key === "max" ? state.layout.maxIndex : state.layout.minIndex
          return { "aria-hidden": "true", "data-kind": part.key, style: pointStyle(state.layout.points[index]) }
        },
      }),
      /* The last point's mark. */
      end: slot({
        present: (state) => state.values.length > 0,
        attrs: (state) => ({ "aria-hidden": "true", "data-type": state.type, style: pointStyle(state.layout.points.at(-1)) }),
      }),
      /* The hairline at the point being read. */
      cursor: slot({
        attrs: (state) => {
          const index = shownIndex(state)
          return { "aria-hidden": "true", "data-open": state.activeIndex !== null ? "" : undefined, style: pointStyle(index === null ? undefined : state.layout.points[index]) }
        },
      }),
      /* The dot that rides to the point being read. */
      marker: slot({
        present: (state) => state.type !== "bar",
        attrs: (state) => {
          const index = shownIndex(state)
          return { "aria-hidden": "true", "data-open": state.activeIndex !== null ? "" : undefined, style: pointStyle(index === null ? undefined : state.layout.points[index]) }
        },
      }),
      /* The value under the pointer. Words for the eye; the points carry them for screen readers. */
      readout: slot<{}, { open: boolean; label: string; text: string; value: number | null }>({
        state: (state) => {
          const index = shownIndex(state)
          const value = index === null ? undefined : state.values[index]
          return {
            open: state.activeIndex !== null,
            label: index === null ? "" : (state.labels[index] ?? ""),
            text: value === undefined ? "" : state.formatValue(value),
            value: value ?? null,
          }
        },
        attrs: (state) => {
          const index = shownIndex(state)
          const point = index === null ? undefined : state.layout.points[index]
          return {
            "aria-hidden": "true",
            "data-open": state.activeIndex !== null ? "" : undefined,
            "data-side": point && point.x > 70 ? "left" : point && point.x < 30 ? "right" : "center",
            style: pointStyle(point),
          }
        },
      }),

      /* The points, one tab stop with arrow keys between them, each named with its value. */
      points: slot<{}, { keys: string[] }>({
        role: "listbox",
        keys: { none: "Each point moves focus with the arrow keys itself, through roving focus." },
        state: (state) => ({ keys: state.values.map((_, i) => keyOf(i)) }),
        attrs: (state) => ({ "aria-label": state.summary, "aria-orientation": "horizontal" }),
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
        state: (state, part) => ({ active: Number(part.key) === state.activeIndex, index: Number(part.key) }),
        attrs: (state, part) => {
          const index = Number(part.key)
          const band = state.layout.bands[index]
          return {
            "aria-selected": String(index === state.activeIndex),
            "aria-label": pointName(state, index),
            tabindex: part.api.roving.tabIndex(state, part),
            "data-index": part.key,
            "data-active": index === state.activeIndex ? "" : undefined,
            style: band ? css({ "--sparkline-x": band.start, "--sparkline-w": band.size }) : undefined,
          }
        },
        press: ({ api, key }, event) => api.pressPoint(key, event),
        on: {
          keydown: (event, { el, api }) => {
            if (el) api.keydown(event as KeyboardEvent, el)
          },
          focus: (event, { key, api }) => api.focusPoint(key, event as FocusEvent),
        },
        bind: (el, part) => part.api.roving.bind(el, part),
      }),
    }
  },
  agent: { actions: ["selectIndex", "selectLast", "clearActive"] },
})

export {
  percent,
  sparkline,
  sparklineLayout,
  type SparklineBar,
  type SparklineCurve,
  type SparklineLayout,
  type SparklineOptions,
  sparklinePath,
  type SparklineState,
  type SparklineTone,
  type SparklineTrend,
  type SparklineType,
  type SparklineValueFormatter,
  trendOf,
}
