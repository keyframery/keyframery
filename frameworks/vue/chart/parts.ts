/* Animated chart, on UI SDK's core: the Vue twin of src/components/primitives/chart.tsx. UI SDK ships no
   chart, so the behaviour and the geometry come from the core definition (chart-core) and each part is
   rendered here with usePrimitive/usePart. No charting library: bars and labels are elements placed by
   CSS variables, lines, areas and rings are SVG. This file adds the layout those variables need and the
   motion; colours, radii, type and spacing come from the styled parts (Chart.vue and the others).

   - Grow: bars rise from the baseline one after another; lines draw themselves left to right with
     their area unrolling under them; a ring sweeps round from the top.
   - Tween: when the data, the stacking or the hidden series change, every mark travels on a spring.
   - Glide: the cursor, the tooltip and the dot on each line follow the active point; numbers Roll.
   - Collapse: a hidden series folds into its baseline while the others take its room.
   - Press: legend items sink a little and pop back.
   Flourish (--kf-flourish) scales the grow, the staggers, the rolls, the pops and the tooltip's extra
   shrink and blur; tweens, glides and the collapse are feedback and always run. */

import type { OptionsOf } from "@ui-sdk/core"
import { usePart, usePrimitive } from "@ui-sdk/vue/primitive"
import { defineComponent, Fragment, h, type PropType, ref, type VNodeChild } from "vue"

import { chart, type ChartConfig, type ChartDatum, type ChartOptions } from "@/components/keyframery/core/chart-core"
import { cn } from "@/lib/utils"

type Attrs = Record<string, unknown>
type Slots = { default?: (scope: { state: any }) => VNodeChild }

/* The user's attributes with our classes first and theirs last. */
const merged = (attrs: Attrs, base: string, extra?: Attrs) => ({ ...attrs, ...extra, class: cn(base, attrs.class as string) })

/* The default slot when there is one (it gets the part's state), else our own content. */
const content = (slots: Slots, state: unknown, fallback?: () => VNodeChild) =>
  slots.default ? slots.default({ state }) : fallback?.()

/* ---------------------------------------------------------------- Roll */

/* Every digit is a column of 0 to 9 that slides to its value on a spring; other characters ($, k, the
   separators) stay put. Positions are keyed from the right, so a new leading digit is added instead of
   everything shifting. Screen readers get the plain text. */
export const Roll = defineComponent({
  name: "ChartRoll",
  props: { text: { type: String, required: true }, class: { type: String, default: undefined } },
  setup(props) {
    return () => {
      const chars = props.text.split("")
      return [
        h("span", { class: "sr-only" }, props.text),
        h(
          "span",
          { "data-roll": "", "aria-hidden": "true", class: cn("inline-flex h-[1lh] overflow-hidden whitespace-pre tabular-nums", props.class) },
          chars.map((c, i) => {
            const key = chars.length - i
            return /\d/.test(c)
              ? h(
                  "span",
                  {
                    key,
                    style: { "--d": Number(c) },
                    class:
                      "flex flex-col transition-[translate] duration-[calc(520ms*var(--kf-speed,1)*var(--kf-flourish,1))] ease-spring [translate:0_calc(var(--d)*-1lh)] motion-reduce:transition-none!",
                  },
                  Array.from({ length: 10 }, (_, d) => h("span", { key: d, class: "h-[1lh]" }, String(d))),
                )
              : h("span", { key }, c)
          }),
        ),
      ]
    }
  },
})

/* ---------------------------------------------------------------- grid and axes */

const glide = `transition-[top,left,opacity] duration-[calc(560ms*var(--kf-speed,1))] ease-spring motion-reduce:transition-none`

export const ChartGridLine = defineComponent({
  name: "ChartGridLine",
  inheritAttrs: false,
  props: { value: { type: String, required: true } },
  setup(props, { attrs }) {
    const base = cn(
      "absolute inset-x-0 top-[calc(var(--chart-pos)*1%)] h-0",
      "group-data-[orientation=horizontal]/chart:group-data-[type=bar]/chart:inset-x-auto group-data-[orientation=horizontal]/chart:group-data-[type=bar]/chart:inset-y-0 group-data-[orientation=horizontal]/chart:group-data-[type=bar]/chart:top-0 group-data-[orientation=horizontal]/chart:group-data-[type=bar]/chart:left-[calc(var(--chart-pos)*1%)] group-data-[orientation=horizontal]/chart:group-data-[type=bar]/chart:h-auto group-data-[orientation=horizontal]/chart:group-data-[type=bar]/chart:w-0",
      glide,
      "starting:opacity-0",
    )
    return usePart(chart, "grid-line", () => ({ value: props.value }), () => merged(attrs, base), "div")
  },
})

/** Rules at the value ticks. They glide to their new places when the scale changes. */
export const ChartGrid = defineComponent({
  name: "ChartGrid",
  inheritAttrs: false,
  setup(_, { attrs }) {
    return usePart(chart, "grid", undefined, () => merged(attrs, "pointer-events-none absolute inset-0"), {
      tag: "div",
      children: (state) => state.ticks.map((key) => h(ChartGridLine, { key, value: key })),
    })
  },
})

/* Every label sits in the axis' one grid cell, so the widest one sizes the side axis. Each centres on
   its place along the axis. */
export const ChartTick = defineComponent({
  name: "ChartTick",
  inheritAttrs: false,
  props: { value: { type: String, required: true }, axis: { type: String as PropType<"x" | "y">, required: true } },
  setup(props, { attrs, slots }) {
    const base = cn(
      "relative [grid-area:1/1] whitespace-nowrap",
      "data-[axis=x]:justify-self-start data-[axis=x]:left-[calc(var(--chart-pos)*1%)] data-[axis=x]:[translate:-50%_0]",
      "data-[axis=y]:self-start data-[axis=y]:top-[calc(var(--chart-pos)*1%)] data-[axis=y]:[translate:0_-50%]",
      "data-hidden:opacity-0",
      glide,
      "starting:opacity-0",
    )
    return usePart(chart, "tick", () => ({ value: props.value, axis: props.axis }), () => merged(attrs, base), {
      tag: "span",
      children: (state) =>
        content(slots as Slots, state, () => (props.axis === "y" || /\d/.test(state.label) ? h(Roll, { text: state.label }) : state.label)),
    })
  },
})

function axis(slot: "x-axis" | "y-axis", area: string, name: string) {
  return defineComponent({
    name,
    inheritAttrs: false,
    setup(_, { attrs }) {
      const which = slot === "x-axis" ? "x" : "y"
      return usePart(chart, slot, undefined, () => merged(attrs, cn("relative grid min-h-0 min-w-0", area)), {
        tag: "div",
        children: (state) => state.ticks.map((tick) => h(ChartTick, { key: tick.key, value: tick.key, axis: which })),
      })
    },
  })
}

/** The axis along the bottom. It shows the categories, or the values for horizontal bars. */
export const ChartXAxis = axis("x-axis", "[grid-area:x]", "ChartXAxis")
/** The axis up the left side. It shows the values, or the categories for horizontal bars. */
export const ChartYAxis = axis("y-axis", "[grid-area:y]", "ChartYAxis")

/* ---------------------------------------------------------------- cursor */

/** A band behind the active bar group, or a hairline at the active point of a line. It glides. */
export const ChartCursor = defineComponent({
  name: "ChartCursor",
  inheritAttrs: false,
  setup(_, { attrs }) {
    const base = cn(
      "pointer-events-none absolute opacity-0 data-open:opacity-100",
      "inset-y-0 left-[calc(var(--chart-x)*1%)] w-[calc(var(--chart-w)*1%)]",
      "group-data-[orientation=horizontal]/chart:group-data-[type=bar]/chart:inset-x-0 group-data-[orientation=horizontal]/chart:group-data-[type=bar]/chart:inset-y-auto group-data-[orientation=horizontal]/chart:group-data-[type=bar]/chart:top-[calc(var(--chart-x)*1%)] group-data-[orientation=horizontal]/chart:group-data-[type=bar]/chart:h-[calc(var(--chart-w)*1%)] group-data-[orientation=horizontal]/chart:group-data-[type=bar]/chart:w-auto",
      "group-data-[type=line]/chart:left-[calc(var(--chart-c)*1%)] group-data-[type=line]/chart:w-px group-data-[type=area]/chart:left-[calc(var(--chart-c)*1%)] group-data-[type=area]/chart:w-px",
      `[transition:left_calc(380ms*var(--kf-speed,1))_var(--ease-spring),top_calc(380ms*var(--kf-speed,1))_var(--ease-spring),width_calc(380ms*var(--kf-speed,1))_var(--ease-spring),height_calc(380ms*var(--kf-speed,1))_var(--ease-spring),opacity_calc(200ms*var(--kf-speed,1))_var(--ease-house)]`,
      "motion-reduce:transition-none",
    )
    return usePart(chart, "cursor", undefined, () => merged(attrs, base), "div")
  },
})

/* ---------------------------------------------------------------- marks */

/* Bars grow from the baseline one after another, and tween to every new value from there. */
const barMotion = cn(
  "absolute",
  "left-[calc(var(--chart-x)*1%+min(var(--chart-bar-gap,4px),var(--chart-w)*0.3%)/2)] w-[max(0px,calc(var(--chart-w)*1%-min(var(--chart-bar-gap,4px),var(--chart-w)*0.3%)))]",
  "bottom-[calc(var(--chart-y)*1%)] h-[calc(var(--chart-h)*1%)] starting:h-[calc(var(--chart-h)*1%*(1-var(--kf-flourish,1)))]",
  "data-negative:bottom-auto data-negative:top-[calc((100-var(--chart-y)-var(--chart-h))*1%)]",
  "group-data-[orientation=horizontal]/chart:bottom-auto group-data-[orientation=horizontal]/chart:top-[calc(var(--chart-y)*1%+min(var(--chart-bar-gap,4px),var(--chart-h)*0.3%)/2)] group-data-[orientation=horizontal]/chart:h-[max(0px,calc(var(--chart-h)*1%-min(var(--chart-bar-gap,4px),var(--chart-h)*0.3%)))]",
  "group-data-[orientation=horizontal]/chart:left-[calc(var(--chart-x)*1%)] group-data-[orientation=horizontal]/chart:w-[calc(var(--chart-w)*1%)] group-data-[orientation=horizontal]/chart:starting:w-[calc(var(--chart-w)*1%*(1-var(--kf-flourish,1)))] group-data-[orientation=horizontal]/chart:starting:h-[max(0px,calc(var(--chart-h)*1%-min(var(--chart-bar-gap,4px),var(--chart-h)*0.3%)))]",
  "group-data-[orientation=horizontal]/chart:data-negative:left-auto group-data-[orientation=horizontal]/chart:data-negative:right-[calc((100-var(--chart-x)-var(--chart-w))*1%)]",
  `transition-[left,right,top,bottom,width,height] duration-[calc(720ms*var(--kf-speed,1))] ease-spring`,
  `[transition-delay:calc(min(var(--chart-i,0),16)*calc(26ms*var(--kf-speed,1))*var(--kf-flourish,1)),calc(min(var(--chart-i,0),16)*calc(26ms*var(--kf-speed,1))*var(--kf-flourish,1)),calc(min(var(--chart-i,0),16)*calc(26ms*var(--kf-speed,1))*var(--kf-flourish,1)),calc(min(var(--chart-i,0),16)*calc(26ms*var(--kf-speed,1))*var(--kf-flourish,1)),calc((min(var(--chart-i,0),16)*calc(26ms*var(--kf-speed,1))+var(--chart-s,0)*calc(300ms*var(--kf-speed,1)))*var(--kf-flourish,1)),calc((min(var(--chart-i,0),16)*calc(26ms*var(--kf-speed,1))+var(--chart-s,0)*calc(300ms*var(--kf-speed,1)))*var(--kf-flourish,1))]`,
  `group-data-entered/marks:[transition-delay:calc(min(var(--chart-i,0),16)*calc(26ms*var(--kf-speed,1))*var(--kf-flourish,1))]`,
  "motion-reduce:transition-none",
)

/* A line draws itself from the left; it tweens to new values and flattens when hidden. */
const lineMotion = cn(
  "fill-none [d:var(--chart-path)] [vector-effect:non-scaling-stroke]",
  "[clip-path:inset(-50%_-4%_-50%_-4%)] starting:[clip-path:inset(-50%_104%_-50%_-4%)]",
  "data-hidden:opacity-0",
  `[transition:d_calc(720ms*var(--kf-speed,1))_var(--ease-spring),clip-path_calc(1100ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-house),opacity_calc(420ms*var(--kf-speed,1))_var(--ease-house)]`,
  `[transition-delay:0ms,calc(var(--chart-i,0)*calc(90ms*var(--kf-speed,1))*var(--kf-flourish,1)),0ms]`,
  "motion-reduce:transition-none",
)

/* An area unrolls under its line, in step with it. */
const areaMotion = cn(
  "[d:var(--chart-path)]",
  "[clip-path:inset(-50%_-4%_-50%_-4%)] starting:[clip-path:inset(-50%_104%_-50%_-4%)]",
  "data-hidden:opacity-0",
  `[transition:d_calc(720ms*var(--kf-speed,1))_var(--ease-spring),clip-path_calc(1100ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-house),opacity_calc(420ms*var(--kf-speed,1))_var(--ease-house)]`,
  `[transition-delay:0ms,calc(var(--chart-i,0)*calc(90ms*var(--kf-speed,1))*var(--kf-flourish,1)),0ms]`,
  "motion-reduce:transition-none",
)

/* A ring sweeps round from the top; each slice tweens to its new share and shuts when hidden. */
const sliceMotion = cn(
  "fill-none origin-center [transform-box:view-box] -rotate-90",
  "[stroke-dasharray:var(--chart-len)_100] [stroke-dashoffset:var(--chart-offset)] [stroke-width:var(--chart-ring)]",
  "starting:[stroke-dasharray:calc(var(--chart-len)*(1-var(--kf-flourish,1)))_100] starting:[stroke-dashoffset:calc(var(--chart-offset)*(1-var(--kf-flourish,1)))]",
  "group-data-active/chart:opacity-40 data-active:opacity-100!",
  `[transition:stroke-dasharray_calc(900ms*var(--kf-speed,1))_var(--ease-spring),stroke-dashoffset_calc(900ms*var(--kf-speed,1))_var(--ease-spring),opacity_calc(260ms*var(--kf-speed,1))_var(--ease-house)]`,
  `[transition-delay:calc(min(var(--chart-i,0),10)*calc(40ms*var(--kf-speed,1))*var(--kf-flourish,1)),calc(min(var(--chart-i,0),10)*calc(40ms*var(--kf-speed,1))*var(--kf-flourish,1)),0ms]`,
  "motion-reduce:transition-none",
)

/* A dot on a point: it pops in after its line has drawn past it, and while its row is active. */
const dotMotion = cn(
  "absolute left-[calc(var(--chart-x)*1%)] top-[calc(var(--chart-y)*1%)] size-[var(--chart-dot,8px)] -translate-1/2",
  "scale-[calc(1-var(--kf-flourish,1))] opacity-0 data-shown:scale-100 data-shown:opacity-100 starting:scale-[calc(1-var(--kf-flourish,1))] starting:opacity-0",
  "data-hidden:scale-[calc(1-var(--kf-flourish,1))]! data-hidden:opacity-0!",
  `[transition:left_calc(720ms*var(--kf-speed,1))_var(--ease-spring),top_calc(720ms*var(--kf-speed,1))_var(--ease-spring),scale_calc(360ms*var(--kf-speed,1))_var(--ease-pop),opacity_calc(200ms*var(--kf-speed,1))_var(--ease-house)]`,
  `[transition-delay:0ms,0ms,calc(var(--chart-i,0)*calc(60ms*var(--kf-speed,1))*var(--kf-flourish,1)),calc(var(--chart-i,0)*calc(60ms*var(--kf-speed,1))*var(--kf-flourish,1))]`,
  "motion-reduce:transition-none",
)

/* A part keyed by `value`, with one fixed class and nothing inside. */
function valuePart(name: string, slot: "bar" | "line" | "area" | "dot" | "slice", base: string, tag: string) {
  return defineComponent({
    name,
    inheritAttrs: false,
    props: { value: { type: String, required: true } },
    setup(props, { attrs }) {
      return usePart(chart, slot, () => ({ value: props.value }), () => merged(attrs, base), tag)
    },
  })
}

/** One bar. Keyed by its series and category, joined with "\u001f". */
export const ChartBar = valuePart("ChartBar", "bar", barMotion, "div")
/** One series' line. */
export const ChartLine = valuePart("ChartLine", "line", lineMotion, "path")
/** The fill under one series' line. */
export const ChartArea = valuePart("ChartArea", "area", areaMotion, "path")
/** A dot on one point of a line. Keyed by its series and category, joined with "\u001f". */
export const ChartDot = valuePart("ChartDot", "dot", dotMotion, "div")
/** One slice of a pie or donut. */
export const ChartSlice = valuePart("ChartSlice", "slice", sliceMotion, "circle")

export const ChartSvg = defineComponent({
  name: "ChartSvg",
  inheritAttrs: false,
  setup(_, { attrs }) {
    return usePart(chart, "svg", undefined, () => merged(attrs, "absolute inset-0 size-full overflow-visible"), "svg")
  },
})

export const ChartGradient = defineComponent({
  name: "ChartGradient",
  inheritAttrs: false,
  props: { value: { type: String, required: true } },
  setup(props, { attrs }) {
    return usePart(chart, "gradient", () => ({ value: props.value }), () => attrs, {
      tag: "linearGradient",
      children: () => [
        h("stop", { offset: "0", style: { stopColor: "var(--chart-color)", stopOpacity: "var(--chart-area-top,0.32)" } }),
        h("stop", { offset: "1", style: { stopColor: "var(--chart-color)", stopOpacity: "var(--chart-area-bottom,0.02)" } }),
      ],
    })
  },
})

/** The dot that rides to the active point of one series. */
export const ChartMarker = defineComponent({
  name: "ChartMarker",
  inheritAttrs: false,
  props: { value: { type: String, required: true } },
  setup(props, { attrs }) {
    const base = cn(
      "absolute left-[calc(var(--chart-x)*1%)] top-[calc(var(--chart-y)*1%)] size-[calc(var(--chart-dot,8px)+3px)] -translate-1/2 scale-[calc(0.95-0.55*var(--kf-flourish,1))] opacity-0",
      "data-open:scale-100 data-open:opacity-100",
      `[transition:left_calc(380ms*var(--kf-speed,1))_var(--ease-spring),top_calc(380ms*var(--kf-speed,1))_var(--ease-spring),scale_calc(320ms*var(--kf-speed,1))_var(--ease-pop),opacity_calc(180ms*var(--kf-speed,1))_var(--ease-house)]`,
      "motion-reduce:transition-none",
    )
    return usePart(chart, "marker", () => ({ value: props.value }), () => merged(attrs, base), "div")
  },
})

/** The marks for the chart's `type`: bars, lines and areas with their dots, or a ring. */
export const ChartMarks = defineComponent({
  name: "ChartMarks",
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    /* A readiness gate for the stack's arrival: set once the first bar has finished growing. */
    const entered = ref(false)
    const onTransitionend = (event: TransitionEvent) => {
      if (!entered.value && (event.target as HTMLElement).dataset.slot === "chart-bar") entered.value = true
      const theirs = attrs.onTransitionend as ((e: TransitionEvent) => void) | undefined
      theirs?.(event)
    }
    return usePart(
      chart,
      "marks",
      undefined,
      () => merged(attrs, "group/marks pointer-events-none absolute inset-0", { ...(entered.value ? { "data-entered": "" } : null), onTransitionend }),
      {
        tag: "div",
        children: (state) =>
          content(slots as Slots, state, () => {
            if (state.barKeys.length) return state.barKeys.map((key) => h(ChartBar, { key, value: key }))
            if (state.sliceKeys.length) return h(ChartSvg, null, () => state.sliceKeys.map((key) => h(ChartSlice, { key, value: key })))
            return [
              h(ChartSvg, null, () => [
                h("defs", null, state.series.map((s) => h(ChartGradient, { key: s.key, value: s.key }))),
                ...state.series.map((s) => h(ChartArea, { key: `area-${s.key}`, value: s.key })),
                ...state.series.map((s) => h(ChartLine, { key: `line-${s.key}`, value: s.key })),
              ]),
              ...state.series.flatMap((s) => state.categories.map((c) => h(ChartDot, { key: `${s.key}\u001f${c}`, value: `${s.key}\u001f${c}` }))),
              ...state.series.map((s) => h(ChartMarker, { key: `marker-${s.key}`, value: s.key })),
            ]
          }),
      },
    )
  },
})

/** What a donut shows in its hole: the active slice, or the total. Its number Rolls. */
export const ChartCenter = defineComponent({
  name: "ChartCenter",
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return usePart(chart, "center", undefined, () => merged(attrs, "pointer-events-none absolute inset-0 grid place-content-center justify-items-center text-center"), {
      tag: "div",
      children: (state) =>
        content(slots as Slots, state, () => [
          h(Roll, { key: "roll", text: state.text }),
          h(
            "span",
            { key: state.label ?? "total", class: `animate-[kf-chart-rise_calc(360ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-spring)_backwards] motion-reduce:animate-none` },
            state.label ?? "Total",
          ),
        ]),
    })
  },
})

/* ---------------------------------------------------------------- points and tooltip */

/* Placed in the ring's own units on a pie: 1cqmin is one unit of the 0–100 ring box. */
const onRing =
  "group-data-[type=pie]/chart:left-[calc(50%+(var(--chart-x)-50)*1cqmin)] group-data-[type=pie]/chart:top-[calc(50%+(var(--chart-y)-50)*1cqmin)] group-data-[type=donut]/chart:left-[calc(50%+(var(--chart-x)-50)*1cqmin)] group-data-[type=donut]/chart:top-[calc(50%+(var(--chart-y)-50)*1cqmin)]"

export const ChartPoint = defineComponent({
  name: "ChartPoint",
  inheritAttrs: false,
  props: { value: { type: String, required: true } },
  setup(props, { attrs }) {
    const base = cn(
      "absolute inset-y-0 left-[calc(var(--chart-x)*1%)] w-[calc(var(--chart-w)*1%)] outline-none",
      "group-data-[orientation=horizontal]/chart:group-data-[type=bar]/chart:inset-x-0 group-data-[orientation=horizontal]/chart:group-data-[type=bar]/chart:inset-y-auto group-data-[orientation=horizontal]/chart:group-data-[type=bar]/chart:top-[calc(var(--chart-x)*1%)] group-data-[orientation=horizontal]/chart:group-data-[type=bar]/chart:h-[calc(var(--chart-w)*1%)] group-data-[orientation=horizontal]/chart:group-data-[type=bar]/chart:w-auto",
      "group-data-[type=pie]/chart:inset-auto group-data-[type=pie]/chart:size-7 group-data-[type=pie]/chart:-translate-1/2 group-data-[type=donut]/chart:inset-auto group-data-[type=donut]/chart:size-7 group-data-[type=donut]/chart:-translate-1/2",
      onRing,
    )
    return usePart(chart, "point", () => ({ value: props.value }), () => merged(attrs, base), "div")
  },
})

/** The keyboard and screen reader layer: one tab stop, arrow keys between points. */
export const ChartPoints = defineComponent({
  name: "ChartPoints",
  inheritAttrs: false,
  setup(_, { attrs }) {
    return usePart(chart, "points", undefined, () => merged(attrs, "absolute inset-0 outline-none"), {
      tag: "div",
      children: (state) => state.categories.map((key) => h(ChartPoint, { key, value: key })),
    })
  },
})

export const ChartTooltipLabel = defineComponent({
  name: "ChartTooltipLabel",
  inheritAttrs: false,
  setup(_, { attrs }) {
    return usePart(chart, "tooltip-label", undefined, () => attrs, "div")
  },
})

/** The stack's total under the rows, when bars or areas are stacked. */
export const ChartTooltipTotal = defineComponent({
  name: "ChartTooltipTotal",
  inheritAttrs: false,
  setup(_, { attrs }) {
    return usePart(chart, "tooltip-total", undefined, () => attrs, "div")
  },
})

export const ChartTooltipItem = defineComponent({
  name: "ChartTooltipItem",
  inheritAttrs: false,
  props: { value: { type: String, required: true } },
  setup(props, { attrs }) {
    return usePart(chart, "tooltip-item", () => ({ value: props.value }), () => attrs, "div")
  },
})

/** Follows the active point. With no children it shows the category and each series' value, whose
    digits Roll. `indicator` picks the swatch: a dot, a line or a dashed line. */
export const ChartTooltip = defineComponent({
  name: "ChartTooltip",
  inheritAttrs: false,
  props: {
    indicator: { type: String as PropType<"dot" | "line" | "dashed">, default: "dot" },
    hideLabel: { type: Boolean, default: false },
  },
  setup(props, { attrs, slots }) {
    const base = cn(
      "pointer-events-none absolute z-10 w-max",
      "left-[calc(var(--chart-x)*1%)] top-[calc(var(--chart-y)*1%)]",
      onRing,
      "[translate:14px_calc(var(--chart-y)*-1%)] origin-left data-[side=left]:[translate:calc(-100%-14px)_calc(var(--chart-y)*-1%)] data-[side=left]:origin-right",
      "scale-[calc(0.95-0.09*var(--kf-flourish,1))] opacity-0 blur-[calc(5px*var(--kf-flourish,1))] data-open:scale-100 data-open:opacity-100 data-open:blur-none",
      `[transition:left_calc(420ms*var(--kf-speed,1))_var(--ease-spring),top_calc(420ms*var(--kf-speed,1))_var(--ease-spring),translate_calc(420ms*var(--kf-speed,1))_var(--ease-spring),scale_calc(160ms*var(--kf-speed,1))_var(--ease-house),opacity_calc(160ms*var(--kf-speed,1))_var(--ease-house),filter_calc(160ms*var(--kf-speed,1))_var(--ease-house)]`,
      `data-open:[transition:left_calc(420ms*var(--kf-speed,1))_var(--ease-spring),top_calc(420ms*var(--kf-speed,1))_var(--ease-spring),translate_calc(420ms*var(--kf-speed,1))_var(--ease-spring),scale_calc(320ms*var(--kf-speed,1))_var(--ease-pop),opacity_calc(220ms*var(--kf-speed,1))_var(--ease-house),filter_calc(260ms*var(--kf-speed,1))_var(--ease-house)]`,
      "motion-reduce:transition-none",
    )
    return usePart(chart, "tooltip", undefined, () => merged(attrs, base, { "data-indicator": props.indicator }), {
      tag: "div",
      children: (state) =>
        content(slots as Slots, state, () => [
          props.hideLabel || !state.title ? null : h(ChartTooltipLabel, { key: "label" }, () => state.title),
          ...state.rows.map((row) =>
            h(ChartTooltipItem, { key: row.key, value: row.key }, () => [h("span", { "data-indicator": "" }), h("span", null, row.label), h(Roll, { text: row.text })]),
          ),
          state.total ? h(ChartTooltipTotal, { key: "total" }, () => [h("span", null, "Total"), h(Roll, { text: state.total!.text })]) : null,
        ]),
    })
  },
})

/* ---------------------------------------------------------------- legend */

/** One series' toggle. With no children it shows the series' swatch and label. */
export const ChartLegendItem = defineComponent({
  name: "ChartLegendItem",
  inheritAttrs: false,
  props: { value: { type: String, required: true } },
  setup(props, { attrs, slots }) {
    const base = cn(
      `inline-flex items-center transition-[scale,opacity] duration-[calc(240ms*var(--kf-speed,1))] ease-pop active:scale-[calc(1-0.04*var(--kf-flourish,1))] motion-reduce:transition-none`,
      `[&>[data-indicator]]:transition-[scale,background-color,box-shadow] [&>[data-indicator]]:duration-[calc(320ms*var(--kf-speed,1))] [&>[data-indicator]]:ease-pop`,
      "data-hidden:[&>[data-indicator]]:scale-[0.7]",
    )
    return usePart(chart, "legend-item", () => ({ value: props.value }), () => merged(attrs, base), {
      tag: "button",
      children: (state) => content(slots as Slots, state, () => [h("span", { "data-indicator": "" }), state.label]),
    })
  },
})

/** The series as toggles: pressing one hides it or brings it back. `side` puts it above or below the plot. */
export const ChartLegend = defineComponent({
  name: "ChartLegend",
  inheritAttrs: false,
  props: { side: { type: String as PropType<"top" | "bottom">, default: "bottom" } },
  setup(props, { attrs, slots }) {
    return usePart(chart, "legend", undefined, () => merged(attrs, "flex flex-wrap [grid-area:bottom] data-[side=top]:[grid-area:top]", { "data-side": props.side }), {
      tag: "div",
      children: (state) => content(slots as Slots, state, () => state.items.map((item) => h(ChartLegendItem, { key: item.value, value: item.value }))),
    })
  },
})

/* ---------------------------------------------------------------- table */

/** The numbers as a table, for screen readers. Visually hidden; drop the class to show it. */
export const ChartTable = defineComponent({
  name: "ChartTable",
  inheritAttrs: false,
  setup(_, { attrs }) {
    return usePart(chart, "table", undefined, () => merged(attrs, "sr-only"), {
      tag: "table",
      children: (state) => [
        h("thead", null, [h("tr", null, state.head.map((cell, i) => h("th", { key: i, scope: "col" }, cell)))]),
        h(
          "tbody",
          null,
          state.rows.map((row) =>
            h("tr", { key: row.key }, row.cells.map((cell, i) => (i === 0 ? h("th", { key: i, scope: "row" }, cell) : h("td", { key: i }, cell)))),
          ),
        ),
      ],
    })
  },
})

/* ---------------------------------------------------------------- plot */

/** The plot. With no children it draws the grid, the cursor, the marks, a donut's centre and the
    tooltip. The points (the keyboard and screen reader layer) are always added. */
export const ChartPlot = defineComponent({
  name: "ChartPlot",
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    /* A size container, so a ring's overlays can place themselves in the ring's own units. */
    return usePart(chart, "plot", undefined, () => merged(attrs, "relative min-h-0 min-w-0 [grid-area:plot] [container-type:size] touch-pan-y"), {
      tag: "div",
      children: (state) => [
        h(Fragment, { key: "content" }, [
          content(slots as Slots, state, () => [h(ChartGrid), h(ChartCursor), h(ChartMarks), h(ChartCenter), h(ChartTooltip)]),
        ]),
        h(ChartPoints, { key: "points" }),
      ],
    })
  },
})

/* ---------------------------------------------------------------- root */

/* The frame: a grid with the legend above or below, the side axis left of the plot and the bottom
   axis under it. A part you leave out leaves no gap. */
const rootLayout = cn(
  "group/chart relative grid min-w-0 grid-cols-[auto_minmax(0,1fr)] grid-rows-[auto_minmax(0,1fr)_auto_auto]",
  "[grid-template-areas:'top_top'_'y_plot'_'._x'_'bottom_bottom']",
)

const optional = { type: Boolean, default: undefined }

/** The chart. With no children it draws the legend (for more than one series or a pie), both axes and
    the plot. A data table for screen readers always comes along. Name it with `aria-label`. */
export const Chart = defineComponent({
  name: "Chart",
  inheritAttrs: false,
  props: {
    data: { type: Array as PropType<ChartDatum[]>, default: undefined },
    config: { type: Object as PropType<ChartConfig>, default: undefined },
    categoryKey: { type: String, default: undefined },
    type: { type: String as PropType<ChartOptions["type"]>, default: undefined },
    stacked: optional,
    orientation: { type: String as PropType<ChartOptions["orientation"]>, default: undefined },
    curve: { type: String as PropType<ChartOptions["curve"]>, default: undefined },
    categoryGap: { type: Number, default: undefined },
    innerRadius: { type: Number, default: undefined },
    padAngle: { type: Number, default: undefined },
    dots: optional,
    formatValue: { type: Function as PropType<ChartOptions["formatValue"]>, default: undefined },
    formatTick: { type: Function as PropType<ChartOptions["formatTick"]>, default: undefined },
    formatCategory: { type: Function as PropType<ChartOptions["formatCategory"]>, default: undefined },
    activeIndex: { type: null as unknown as PropType<number | null>, default: undefined },
    defaultActiveIndex: { type: null as unknown as PropType<number | null>, default: undefined },
    hiddenSeries: { type: Array as PropType<string[]>, default: undefined },
    defaultHiddenSeries: { type: Array as PropType<string[]>, default: undefined },
  },
  emits: {
    activeIndexChange: (..._args: Parameters<NonNullable<ChartOptions["onActiveIndexChange"]>>) => true,
    "update:activeIndex": (_index: number | null) => true,
    hiddenSeriesChange: (..._args: Parameters<NonNullable<ChartOptions["onHiddenSeriesChange"]>>) => true,
    "update:hiddenSeries": (_hidden: string[]) => true,
  },
  setup(props, { attrs, slots, emit }) {
    const handle = usePrimitive(chart, () => ({
      data: props.data,
      config: props.config,
      categoryKey: props.categoryKey,
      type: props.type,
      stacked: props.stacked,
      orientation: props.orientation,
      curve: props.curve,
      categoryGap: props.categoryGap,
      innerRadius: props.innerRadius,
      padAngle: props.padAngle,
      dots: props.dots,
      formatValue: props.formatValue,
      formatTick: props.formatTick,
      formatCategory: props.formatCategory,
      activeIndex: props.activeIndex,
      defaultActiveIndex: props.defaultActiveIndex,
      hiddenSeries: props.hiddenSeries,
      defaultHiddenSeries: props.defaultHiddenSeries,
      onActiveIndexChange: (index, details) => {
        emit("activeIndexChange", index, details)
        if (!(details as { canceled?: boolean } | undefined)?.canceled) emit("update:activeIndex", index)
      },
      onHiddenSeriesChange: (hidden, details) => {
        emit("hiddenSeriesChange", hidden, details)
        if (!(details as { canceled?: boolean } | undefined)?.canceled) emit("update:hiddenSeries", hidden)
      },
    }) as OptionsOf<typeof chart>)
    return usePart(handle, "root", undefined, () => merged(attrs, rootLayout), {
      tag: "figure",
      /* The data table always comes along, so a chart you compose yourself keeps it. */
      children: (state) => [
        h(Fragment, { key: "content" }, [
          content(slots as Slots, state, () => [
            state.radial || state.series.length > 1 ? h(ChartLegend) : null,
            h(ChartYAxis),
            h(ChartPlot),
            h(ChartXAxis),
          ]),
        ]),
        h(ChartTable, { key: "table" }),
      ],
    })
  },
})
