/* Stats, as UI SDK primitives. UI SDK ships no stat, so they are defined with its core: the same
   definitions render in React, Vue, Svelte, Solid and web components.

   `stat` is the KPI card of a dashboard: a label, a value, a delta with its direction (up, down or
   flat), a comparison line, an optional icon and an optional slot for a sparkline, with a loading
   state. The delta's direction is state, and so is whether it is good news: `downIsGood` turns the
   meaning round for numbers that should fall, like refunds. Agents read the label, the value and
   the delta.

   `statGroup` lays several stats out as one object: one surface, dividers between them. */

import { definePrimitive } from "@ui-sdk/core"

type StatTrend = "up" | "down" | "flat"
/** Whether the delta is good news: `positive`, `negative`, or `neutral` when it is flat. */
type StatTone = "positive" | "negative" | "neutral"
type StatValueFormatter = (value: number) => string
type StatDeltaFormatter = (delta: number) => string

type StatOptions = {
  /** What the number is, like "Revenue". Names the stat for screen readers and agents. */
  label?: string
  /** The number. `null` while there is none. */
  value?: number | null
  /** Formats the value, like `(v) => "$" + v.toLocaleString()`. */
  formatValue?: StatValueFormatter
  /** The change against the comparison period, as a share: 0.124 is up 12.4%. `null` for none. */
  delta?: number | null
  /** Formats the delta's size (always positive; the sign is drawn by the direction). Defaults to "12.4%". */
  formatDelta?: StatDeltaFormatter
  /** A fall is good news (refunds, churn, costs): the tone turns round. */
  downIsGood?: boolean
  /** A delta smaller than this counts as flat. Defaults to 0.0005 (0.05%). */
  flatThreshold?: number
  /** Shows placeholders at the parts' own size instead of the numbers. */
  loading?: boolean
}

type StatState = {
  label: string
  value: number | null
  valueText: string
  delta: number | null
  deltaText: string
  trend: StatTrend
  tone: StatTone
  loading: boolean
  downIsGood: boolean
}

const groupFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 })
const defaultFormatValue: StatValueFormatter = (value) => groupFormat.format(value)
/** "12%", or "4.2%" under ten. */
const defaultFormatDelta: StatDeltaFormatter = (delta) => {
  const value = Math.abs(delta) * 100
  return `${value < 10 ? (Math.round(value * 10) / 10).toFixed(1) : Math.round(value)}%`
}

function stateOf(options: StatOptions): StatState {
  const value = typeof options.value === "number" && Number.isFinite(options.value) ? options.value : null
  const delta = typeof options.delta === "number" && Number.isFinite(options.delta) ? options.delta : null
  const threshold = options.flatThreshold ?? 0.0005
  const downIsGood = options.downIsGood ?? false
  const trend: StatTrend = delta === null || Math.abs(delta) <= threshold ? "flat" : delta > 0 ? "up" : "down"
  const tone: StatTone = trend === "flat" ? "neutral" : (trend === "up") !== downIsGood ? "positive" : "negative"
  const format = options.formatValue ?? defaultFormatValue
  return {
    label: options.label ?? "",
    value,
    valueText: value === null ? "—" : format(value),
    delta,
    deltaText: delta === null ? "" : (options.formatDelta ?? defaultFormatDelta)(delta),
    trend,
    tone,
    loading: options.loading ?? false,
    downIsGood,
  }
}

/** What the delta says in words: "up 12%", "down 3.1%", "no change". */
function deltaWords(state: Pick<StatState, "trend" | "deltaText" | "delta">) {
  if (state.delta === null) return ""
  return state.trend === "flat" ? "no change" : `${state.trend} ${state.deltaText}`
}

const stat = definePrimitive({
  name: "stat",
  options: {
    label: "string",
    value: "value",
    formatValue: "value",
    delta: "value",
    formatDelta: "value",
    downIsGood: "boolean",
    flatThreshold: "number",
    loading: "boolean",
  },
  /* Read-only: an agent reads the label, the value, the delta and its news, and sets nothing. */
  controlled: ["label", "value", "valueText", "delta", "deltaText", "trend", "tone", "loading"],
  state: (options: StatOptions): StatState => stateOf(options),
  sync: (options) => stateOf(options),
  api: () => ({}),
  slots: (slot) => ({
    /* A group named by its label. While loading it is busy. */
    root: slot<{}, { label: string; trend: StatTrend; tone: StatTone; loading: boolean }>({
      role: "group",
      state: (state) => ({ label: state.label, trend: state.trend, tone: state.tone, loading: state.loading }),
      attrs: (state) => ({
        "aria-label": state.label || undefined,
        "aria-busy": state.loading ? "true" : undefined,
        "data-trend": state.trend,
        "data-tone": state.tone,
        "data-loading": state.loading ? "" : undefined,
      }),
    }),
    /* The label. With no children it shows `label`. */
    label: slot<{}, { label: string }>({
      state: (state) => ({ label: state.label }),
      attrs: (state) => ({ "data-loading": state.loading ? "" : undefined }),
    }),
    /* The number. With no children it shows the formatted value. */
    value: slot<{}, { text: string; value: number | null }>({
      state: (state) => ({ text: state.valueText, value: state.value }),
      attrs: (state) => ({ "data-loading": state.loading ? "" : undefined }),
    }),
    /* The change, with its direction and whether it is good news. */
    delta: slot<{}, { text: string; words: string; trend: StatTrend; tone: StatTone }>({
      present: (state) => state.delta !== null || state.loading,
      state: (state) => ({ text: state.deltaText, words: deltaWords(state), trend: state.trend, tone: state.tone }),
      attrs: (state) => ({
        "data-trend": state.trend,
        "data-tone": state.tone,
        "data-loading": state.loading ? "" : undefined,
      }),
    }),
    /* What the delta compares against, like "vs last 30 days". */
    comparison: slot({
      attrs: (state) => ({ "data-loading": state.loading ? "" : undefined }),
    }),
    /* A small icon for the number. Decorative. */
    icon: slot({
      attrs: (state) => ({ "aria-hidden": "true", "data-loading": state.loading ? "" : undefined }),
    }),
    /* Holds a sparkline (or any small chart) under the number. */
    chart: slot<{}, { trend: StatTrend; tone: StatTone }>({
      state: (state) => ({ trend: state.trend, tone: state.tone }),
      attrs: (state) => ({ "data-tone": state.tone, "data-loading": state.loading ? "" : undefined }),
    }),
  }),
  agent: { actions: [] },
})

/* A row of stats on one surface. Layout and dividers are the renderer's; the group names them. */
const statGroup = definePrimitive({
  name: "stat-group",
  state: () => ({}),
  api: () => ({}),
  slots: (slot) => ({
    /* A group of stats. Name it with `aria-label`, like "Store, last 30 days". */
    root: slot({ role: "group" }),
    /* The grid the stats sit in. */
    grid: slot({}),
  }),
  agent: { actions: [] },
})

export {
  defaultFormatDelta,
  deltaWords,
  stat,
  type StatDeltaFormatter,
  statGroup,
  type StatOptions,
  type StatState,
  type StatTone,
  type StatTrend,
  type StatValueFormatter,
}
