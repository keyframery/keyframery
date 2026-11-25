"use client"

/* Animated chart, on UI SDK's core. UI SDK ships no chart, so the behaviour and the geometry are
   defined in `@/components/core/chart` with `definePrimitive` and rendered here, with shadcn's
   names where they fit (Chart, also exported as ChartContainer; ChartTooltip; ChartLegend;
   ChartXAxis; ChartYAxis; ChartGrid). No charting library: bars and labels are elements placed by
   CSS variables, lines, areas and rings are SVG. This file adds the layout those variables need and
   the motion. Colours, radii, type and spacing stay yours.

   - Grow: bars rise from the baseline one after another; lines draw themselves left to right with
     their area unrolling under them; a ring sweeps round from the top.
   - Tween: when the data, the stacking or the hidden series change, every bar, line, slice, tick
     and grid line travels to its new place on a spring. Nothing jumps.
   - Glide: the cursor, the tooltip and the dot on each line follow the active point; the tooltip
     swings to the other side of the cursor near the right edge, and its numbers Roll.
   - Collapse: a hidden series folds into its baseline (bars to zero, lines flat, slices shut)
     while the others take its room.
   - Press: legend items sink a little and pop back.

   Each moving value is a CSS variable from the core (`--chart-x`, `--chart-y`, `--chart-w`,
   `--chart-h` in percent, `--chart-path`, `--chart-len`, `--chart-offset`), so the tween is a
   plain CSS transition. Lines and areas tween their `d` where the browser can (Chrome, Firefox);
   elsewhere they change in place while the bars, dots and ticks still move. */

import type { SlotName, StateOf } from "@ui-sdk/core"
import { type PartProps, usePart, usePrimitive } from "@ui-sdk/react/primitive"
import * as React from "react"

import { chart, type ChartOptions } from "@/components/core/chart"
import { cn } from "@/lib/utils"

type ChartPart<Slot extends SlotName<typeof chart>, Tag extends keyof React.JSX.IntrinsicElements = "div"> = PartProps<Tag, StateOf<typeof chart, Slot>>

/* UI SDK parts take a class name or a function of the part's state. Keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

/* ---------------------------------------------------------------- Roll */

/* Roll: every digit is a column of 0 to 9 that slides to its value on a spring; other characters
   ($, k, the separators) stay put. Positions are keyed from the right, so a new leading digit is
   added instead of everything shifting. Screen readers get the plain text. */
function Roll({ text, className }: { text: string; className?: string }) {
  const chars = text.split("")
  return (
    <>
      <span className="sr-only">{text}</span>
      <span data-roll="" aria-hidden className={cn("inline-flex h-[1lh] overflow-hidden whitespace-pre tabular-nums", className)}>
        {chars.map((c, i) => {
          const key = chars.length - i
          return /\d/.test(c) ? (
            <span
              key={key}
              style={{ "--d": Number(c) } as React.CSSProperties}
              className="flex flex-col transition-[translate] duration-[calc(520ms*var(--kf-speed,1))] ease-spring [translate:0_calc(var(--d)*-1lh)] motion-reduce:transition-none!"
            >
              {Array.from({ length: 10 }, (_, d) => (
                <span key={d} className="h-[1lh]">
                  {d}
                </span>
              ))}
            </span>
          ) : (
            <span key={key}>{c}</span>
          )
        })}
      </span>
    </>
  )
}

/* ---------------------------------------------------------------- root */

/* The frame: a grid with the legend above or below, the side axis left of the plot and the bottom
   axis under it. A part you leave out leaves no gap. */
const rootLayout = cn(
  "group/chart relative grid min-w-0 grid-cols-[auto_minmax(0,1fr)] grid-rows-[auto_minmax(0,1fr)_auto_auto]",
  "[grid-template-areas:'top_top'_'y_plot'_'._x'_'bottom_bottom']",
)

type ChartProps = ChartOptions & Omit<ChartPart<"root", "figure">, keyof ChartOptions>

/** The chart. With no children it draws the legend (for more than one series or a pie), both axes
    and the plot. A data table for screen readers always comes along. Name it with `aria-label`. */
function Chart({
  data,
  config,
  categoryKey,
  type,
  stacked,
  orientation,
  curve,
  categoryGap,
  innerRadius,
  padAngle,
  dots,
  formatValue,
  formatTick,
  formatCategory,
  activeIndex,
  defaultActiveIndex,
  onActiveIndexChange,
  hiddenSeries,
  defaultHiddenSeries,
  onHiddenSeriesChange,
  className,
  children,
  ...props
}: ChartProps) {
  const handle = usePrimitive(chart, {
    data,
    config,
    categoryKey,
    type,
    stacked,
    orientation,
    curve,
    categoryGap,
    innerRadius,
    padAngle,
    dots,
    formatValue,
    formatTick,
    formatCategory,
    activeIndex,
    defaultActiveIndex,
    onActiveIndexChange,
    hiddenSeries,
    defaultHiddenSeries,
    onHiddenSeriesChange,
  })
  return usePart(
    handle,
    "root",
    {},
    {
      ...props,
      className: withClass(rootLayout, className),
      /* The data table always comes along, so a chart you compose yourself keeps it. */
      children: (state) => (
        <>
          {typeof children === "function"
            ? children(state)
            : (children ?? (
                <>
                  {state.radial || state.series.length > 1 ? <ChartLegend /> : null}
                  <ChartYAxis />
                  <ChartPlot />
                  <ChartXAxis />
                </>
              ))}
          <ChartTable />
        </>
      ),
    },
    "figure",
  )
}

/* ---------------------------------------------------------------- plot */

/** The plot. With no children it draws the grid, the cursor, the marks, a donut's centre and the
    tooltip. The points (the keyboard and screen reader layer) are always added. */
function ChartPlot({ className, children, ...props }: ChartPart<"plot">) {
  return usePart(
    chart,
    "plot",
    {},
    {
      ...props,
      /* A size container, so a ring's overlays can place themselves in the ring's own units. */
      className: withClass("relative min-h-0 min-w-0 [grid-area:plot] [container-type:size] touch-pan-y", className),
      children: (state) => (
        <>
          {typeof children === "function" ? children(state) : (children ?? (
            <>
              <ChartGrid />
              <ChartCursor />
              <ChartMarks />
              <ChartCenter />
              <ChartTooltip />
            </>
          ))}
          <ChartPoints />
        </>
      ),
    },
    "div",
  )
}

/* ---------------------------------------------------------------- grid and axes */

const glide = `transition-[top,left,opacity] duration-[calc(560ms*var(--kf-speed,1))] ease-spring motion-reduce:transition-none`

/** Rules at the value ticks. They glide to their new places when the scale changes. */
function ChartGrid({ className, ...props }: ChartPart<"grid">) {
  return usePart(
    chart,
    "grid",
    {},
    {
      ...props,
      className: withClass("pointer-events-none absolute inset-0", className),
      children: (state) => state.ticks.map((key) => <ChartGridLine key={key} value={key} />),
    },
    "div",
  )
}

function ChartGridLine({ value, className, ...props }: { value: string } & Omit<ChartPart<"grid-line">, "value">) {
  return usePart(
    chart,
    "grid-line",
    { value },
    {
      ...props,
      className: withClass(
        cn(
          "absolute inset-x-0 top-[calc(var(--chart-pos)*1%)] h-0",
          "group-data-[orientation=horizontal]/chart:group-data-[type=bar]/chart:inset-x-auto group-data-[orientation=horizontal]/chart:group-data-[type=bar]/chart:inset-y-0 group-data-[orientation=horizontal]/chart:group-data-[type=bar]/chart:top-0 group-data-[orientation=horizontal]/chart:group-data-[type=bar]/chart:left-[calc(var(--chart-pos)*1%)] group-data-[orientation=horizontal]/chart:group-data-[type=bar]/chart:h-auto group-data-[orientation=horizontal]/chart:group-data-[type=bar]/chart:w-0",
          glide,
          "starting:opacity-0",
        ),
        className,
      ),
    },
    "div",
  )
}

function axis(slot: "x-axis" | "y-axis", area: string) {
  return function ChartAxis({ className, ...props }: ChartPart<typeof slot>) {
    const which = slot === "x-axis" ? "x" : "y"
    return usePart(
      chart,
      slot,
      {},
      {
        ...props,
        className: withClass(cn("relative grid min-h-0 min-w-0", area), className),
        children: (state) => state.ticks.map((tick) => <ChartTick key={tick.key} value={tick.key} axis={which} />),
      },
      "div",
    )
  }
}

/** The axis along the bottom. It shows the categories, or the values for horizontal bars. */
const ChartXAxis = axis("x-axis", "[grid-area:x]")
/** The axis up the left side. It shows the values, or the categories for horizontal bars. */
const ChartYAxis = axis("y-axis", "[grid-area:y]")

/* Every label sits in the axis' one grid cell, so the widest one sizes the side axis. Each centres
   on its place along the axis. */
function ChartTick({ value, axis, className, children, ...props }: { value: string; axis: "x" | "y" } & Omit<ChartPart<"tick">, "value">) {
  return usePart(
    chart,
    "tick",
    { value, axis },
    {
      ...props,
      className: withClass(
        cn(
          "relative [grid-area:1/1] whitespace-nowrap",
          "data-[axis=x]:justify-self-start data-[axis=x]:left-[calc(var(--chart-pos)*1%)] data-[axis=x]:[translate:-50%_0]",
          "data-[axis=y]:self-start data-[axis=y]:top-[calc(var(--chart-pos)*1%)] data-[axis=y]:[translate:0_-50%]",
          "data-hidden:opacity-0",
          glide,
          "starting:opacity-0",
        ),
        className,
      ),
      children: children ?? ((state) => (axis === "y" || /\d/.test(state.label) ? <Roll text={state.label} /> : state.label)),
    },
    "span",
  )
}

/* ---------------------------------------------------------------- cursor */

/** A band behind the active bar group, or a hairline at the active point of a line. It glides. */
function ChartCursor({ className, ...props }: ChartPart<"cursor">) {
  return usePart(
    chart,
    "cursor",
    {},
    {
      ...props,
      className: withClass(
        cn(
          "pointer-events-none absolute opacity-0 data-open:opacity-100",
          "inset-y-0 left-[calc(var(--chart-x)*1%)] w-[calc(var(--chart-w)*1%)]",
          "group-data-[orientation=horizontal]/chart:group-data-[type=bar]/chart:inset-x-0 group-data-[orientation=horizontal]/chart:group-data-[type=bar]/chart:inset-y-auto group-data-[orientation=horizontal]/chart:group-data-[type=bar]/chart:top-[calc(var(--chart-x)*1%)] group-data-[orientation=horizontal]/chart:group-data-[type=bar]/chart:h-[calc(var(--chart-w)*1%)] group-data-[orientation=horizontal]/chart:group-data-[type=bar]/chart:w-auto",
          "group-data-[type=line]/chart:left-[calc(var(--chart-c)*1%)] group-data-[type=line]/chart:w-px group-data-[type=area]/chart:left-[calc(var(--chart-c)*1%)] group-data-[type=area]/chart:w-px",
          `[transition:left_calc(380ms*var(--kf-speed,1))_var(--ease-spring),top_calc(380ms*var(--kf-speed,1))_var(--ease-spring),width_calc(380ms*var(--kf-speed,1))_var(--ease-spring),height_calc(380ms*var(--kf-speed,1))_var(--ease-spring),opacity_calc(200ms*var(--kf-speed,1))_var(--ease-house)]`,
          "motion-reduce:transition-none",
        ),
        className,
      ),
    },
    "div",
  )
}

/* ---------------------------------------------------------------- marks */

/* Bars grow from the baseline one after another, and tween to every new value from there. The gap
   between bars in a group never takes more than a third of a bar's slot. */
const barMotion = cn(
  "absolute",
  /* Standing up: across from --chart-x, up from --chart-y. Below zero they hang from the baseline. */
  "left-[calc(var(--chart-x)*1%+min(var(--chart-bar-gap,4px),var(--chart-w)*0.3%)/2)] w-[max(0px,calc(var(--chart-w)*1%-min(var(--chart-bar-gap,4px),var(--chart-w)*0.3%)))]",
  "bottom-[calc(var(--chart-y)*1%)] h-[calc(var(--chart-h)*1%)] starting:h-0",
  "data-negative:bottom-auto data-negative:top-[calc((100-var(--chart-y)-var(--chart-h))*1%)]",
  /* Lying down: down from --chart-y, right from --chart-x. */
  "group-data-[orientation=horizontal]/chart:bottom-auto group-data-[orientation=horizontal]/chart:top-[calc(var(--chart-y)*1%+min(var(--chart-bar-gap,4px),var(--chart-h)*0.3%)/2)] group-data-[orientation=horizontal]/chart:h-[max(0px,calc(var(--chart-h)*1%-min(var(--chart-bar-gap,4px),var(--chart-h)*0.3%)))]",
  "group-data-[orientation=horizontal]/chart:left-[calc(var(--chart-x)*1%)] group-data-[orientation=horizontal]/chart:w-[calc(var(--chart-w)*1%)] group-data-[orientation=horizontal]/chart:starting:w-0 group-data-[orientation=horizontal]/chart:starting:h-[max(0px,calc(var(--chart-h)*1%-min(var(--chart-bar-gap,4px),var(--chart-h)*0.3%)))]",
  "group-data-[orientation=horizontal]/chart:data-negative:left-auto group-data-[orientation=horizontal]/chart:data-negative:right-[calc((100-var(--chart-x)-var(--chart-w))*1%)]",
  `transition-[left,right,top,bottom,width,height] duration-[calc(720ms*var(--kf-speed,1))] ease-spring`,
  /* Stacked, on arrival: each segment waits for the one under it, so a stack builds up from the
     baseline (--chart-s is its place in the stack, 0 when not stacked). Once the bars have arrived
     every later change tweens together, so the segments stay joined. */
  `[transition-delay:calc(min(var(--chart-i,0),16)*calc(26ms*var(--kf-speed,1))),calc(min(var(--chart-i,0),16)*calc(26ms*var(--kf-speed,1))),calc(min(var(--chart-i,0),16)*calc(26ms*var(--kf-speed,1))),calc(min(var(--chart-i,0),16)*calc(26ms*var(--kf-speed,1))),calc(min(var(--chart-i,0),16)*calc(26ms*var(--kf-speed,1))+var(--chart-s,0)*calc(300ms*var(--kf-speed,1))),calc(min(var(--chart-i,0),16)*calc(26ms*var(--kf-speed,1))+var(--chart-s,0)*calc(300ms*var(--kf-speed,1)))]`,
  `group-data-entered/marks:[transition-delay:calc(min(var(--chart-i,0),16)*calc(26ms*var(--kf-speed,1)))]`,
  "motion-reduce:transition-none",
)

/* A line draws itself from the left; it tweens to new values and flattens when hidden. */
const lineMotion = cn(
  "fill-none [d:var(--chart-path)] [vector-effect:non-scaling-stroke]",
  "[clip-path:inset(-50%_-4%_-50%_-4%)] starting:[clip-path:inset(-50%_104%_-50%_-4%)]",
  "data-hidden:opacity-0",
  `[transition:d_calc(720ms*var(--kf-speed,1))_var(--ease-spring),clip-path_calc(1100ms*var(--kf-speed,1))_var(--ease-house),opacity_calc(420ms*var(--kf-speed,1))_var(--ease-house)]`,
  `[transition-delay:0ms,calc(var(--chart-i,0)*calc(90ms*var(--kf-speed,1))),0ms]`,
  "motion-reduce:transition-none",
)

/* An area unrolls under its line, in step with it. */
const areaMotion = cn(
  "[d:var(--chart-path)]",
  "[clip-path:inset(-50%_-4%_-50%_-4%)] starting:[clip-path:inset(-50%_104%_-50%_-4%)]",
  "data-hidden:opacity-0",
  `[transition:d_calc(720ms*var(--kf-speed,1))_var(--ease-spring),clip-path_calc(1100ms*var(--kf-speed,1))_var(--ease-house),opacity_calc(420ms*var(--kf-speed,1))_var(--ease-house)]`,
  `[transition-delay:0ms,calc(var(--chart-i,0)*calc(90ms*var(--kf-speed,1))),0ms]`,
  "motion-reduce:transition-none",
)

/* A ring sweeps round from the top; each slice tweens to its new share and shuts when hidden. While
   one slice is active the others fade back. */
const sliceMotion = cn(
  "fill-none origin-center [transform-box:view-box] -rotate-90",
  "[stroke-dasharray:var(--chart-len)_100] [stroke-dashoffset:var(--chart-offset)] [stroke-width:var(--chart-ring)]",
  "starting:[stroke-dasharray:0_100] starting:[stroke-dashoffset:0]",
  /* The active slice keeps its shape (so every gap stays even and nothing crosses the centre);
     the others step back while one is active. */
  "group-data-active/chart:opacity-40 data-active:opacity-100!",
  `[transition:stroke-dasharray_calc(900ms*var(--kf-speed,1))_var(--ease-spring),stroke-dashoffset_calc(900ms*var(--kf-speed,1))_var(--ease-spring),opacity_calc(260ms*var(--kf-speed,1))_var(--ease-house)]`,
  `[transition-delay:calc(min(var(--chart-i,0),10)*calc(40ms*var(--kf-speed,1))),calc(min(var(--chart-i,0),10)*calc(40ms*var(--kf-speed,1))),0ms]`,
  "motion-reduce:transition-none",
)

/* A dot on a point: it pops in after its line has drawn past it, and while its row is active. */
const dotMotion = cn(
  "absolute left-[calc(var(--chart-x)*1%)] top-[calc(var(--chart-y)*1%)] size-[var(--chart-dot,8px)] -translate-1/2",
  "scale-0 opacity-0 data-shown:scale-100 data-shown:opacity-100 starting:scale-0 starting:opacity-0",
  "data-hidden:scale-0! data-hidden:opacity-0!",
  `[transition:left_calc(720ms*var(--kf-speed,1))_var(--ease-spring),top_calc(720ms*var(--kf-speed,1))_var(--ease-spring),scale_calc(360ms*var(--kf-speed,1))_var(--ease-pop),opacity_calc(200ms*var(--kf-speed,1))_var(--ease-house)]`,
  `[transition-delay:0ms,0ms,calc(var(--chart-i,0)*calc(60ms*var(--kf-speed,1))),calc(var(--chart-i,0)*calc(60ms*var(--kf-speed,1)))]`,
  "motion-reduce:transition-none",
)

/** The marks for the chart's `type`: bars, lines and areas with their dots, or a ring. */
function ChartMarks({ className, children, onTransitionEnd, ...props }: ChartPart<"marks">) {
  /* A readiness gate for the stack's arrival: set once the first bar has finished growing. */
  const [entered, setEntered] = React.useState(false)
  return usePart(
    chart,
    "marks",
    {},
    {
      ...props,
      ...(entered ? { "data-entered": "" } : null),
      onTransitionEnd: (event: React.TransitionEvent<HTMLDivElement>) => {
        if (!entered && (event.target as HTMLElement).dataset.slot === "chart-bar") setEntered(true)
        onTransitionEnd?.(event)
      },
      className: withClass("group/marks pointer-events-none absolute inset-0", className),
      children:
        children ??
        ((state) => {
          if (state.barKeys.length) return state.barKeys.map((key) => <ChartBar key={key} value={key} />)
          if (state.sliceKeys.length)
            return (
              <ChartSvg>
                {state.sliceKeys.map((key) => (
                  <ChartSlice key={key} value={key} />
                ))}
              </ChartSvg>
            )
          return (
            <>
              <ChartSvg>
                <defs>
                  {state.series.map((s) => (
                    <ChartGradient key={s.key} value={s.key} />
                  ))}
                </defs>
                {state.series.map((s) => (
                  <ChartArea key={s.key} value={s.key} />
                ))}
                {state.series.map((s) => (
                  <ChartLine key={s.key} value={s.key} />
                ))}
              </ChartSvg>
              {state.series.flatMap((s) =>
                state.categories.map((c) => <ChartDot key={`${s.key}\u001f${c}`} value={`${s.key}\u001f${c}`} />),
              )}
              {state.series.map((s) => (
                <ChartMarker key={s.key} value={s.key} />
              ))}
            </>
          )
        }),
    },
    "div",
  )
}

function ChartSvg({ className, ...props }: ChartPart<"svg", "svg">) {
  return usePart(chart, "svg", {}, { ...props, className: withClass("absolute inset-0 size-full overflow-visible", className) }, "svg")
}

function ChartGradient({ value, ...props }: { value: string } & Omit<ChartPart<"gradient", "linearGradient">, "value">) {
  return usePart(
    chart,
    "gradient",
    { value },
    {
      ...props,
      children: (
        <>
          <stop offset="0" style={{ stopColor: "var(--chart-color)", stopOpacity: "var(--chart-area-top,0.32)" }} />
          <stop offset="1" style={{ stopColor: "var(--chart-color)", stopOpacity: "var(--chart-area-bottom,0.02)" }} />
        </>
      ),
    },
    "linearGradient",
  )
}

/** One bar. Keyed by its series and category, joined with "\u001f". */
function ChartBar({ value, className, ...props }: { value: string } & Omit<ChartPart<"bar">, "value">) {
  return usePart(chart, "bar", { value }, { ...props, className: withClass(barMotion, className) }, "div")
}

/** One series' line. */
function ChartLine({ value, className, ...props }: { value: string } & Omit<ChartPart<"line", "path">, "value">) {
  return usePart(chart, "line", { value }, { ...props, className: withClass(lineMotion, className) }, "path")
}

/** The fill under one series' line. */
function ChartArea({ value, className, ...props }: { value: string } & Omit<ChartPart<"area", "path">, "value">) {
  return usePart(chart, "area", { value }, { ...props, className: withClass(areaMotion, className) }, "path")
}

/** A dot on one point of a line. Keyed by its series and category, joined with "\u001f". */
function ChartDot({ value, className, ...props }: { value: string } & Omit<ChartPart<"dot">, "value">) {
  return usePart(chart, "dot", { value }, { ...props, className: withClass(dotMotion, className) }, "div")
}

/** The dot that rides to the active point of one series. */
function ChartMarker({ value, className, ...props }: { value: string } & Omit<ChartPart<"marker">, "value">) {
  return usePart(
    chart,
    "marker",
    { value },
    {
      ...props,
      className: withClass(
        cn(
          "absolute left-[calc(var(--chart-x)*1%)] top-[calc(var(--chart-y)*1%)] size-[calc(var(--chart-dot,8px)+3px)] -translate-1/2 scale-40 opacity-0",
          "data-open:scale-100 data-open:opacity-100",
          `[transition:left_calc(380ms*var(--kf-speed,1))_var(--ease-spring),top_calc(380ms*var(--kf-speed,1))_var(--ease-spring),scale_calc(320ms*var(--kf-speed,1))_var(--ease-pop),opacity_calc(180ms*var(--kf-speed,1))_var(--ease-house)]`,
          "motion-reduce:transition-none",
        ),
        className,
      ),
    },
    "div",
  )
}

/** One slice of a pie or donut. */
function ChartSlice({ value, className, ...props }: { value: string } & Omit<ChartPart<"slice", "circle">, "value">) {
  return usePart(chart, "slice", { value }, { ...props, className: withClass(sliceMotion, className) }, "circle")
}

/** What a donut shows in its hole: the active slice, or the total. Its number Rolls. */
function ChartCenter({ className, children, ...props }: ChartPart<"center">) {
  return usePart(
    chart,
    "center",
    {},
    {
      ...props,
      className: withClass("pointer-events-none absolute inset-0 grid place-content-center justify-items-center text-center", className),
      children:
        children ??
        ((state) => (
          <>
            <Roll text={state.text} />
            <span key={state.label ?? "total"} className={`animate-[kf-chart-rise_calc(360ms*var(--kf-speed,1))_var(--ease-spring)_backwards] motion-reduce:animate-none`}>
              {state.label ?? "Total"}
            </span>
          </>
        )),
    },
    "div",
  )
}

/* ---------------------------------------------------------------- points and tooltip */

/* Placed in the ring's own units on a pie: 1cqmin is one unit of the 0–100 ring box. */
const onRing = "group-data-[type=pie]/chart:left-[calc(50%+(var(--chart-x)-50)*1cqmin)] group-data-[type=pie]/chart:top-[calc(50%+(var(--chart-y)-50)*1cqmin)] group-data-[type=donut]/chart:left-[calc(50%+(var(--chart-x)-50)*1cqmin)] group-data-[type=donut]/chart:top-[calc(50%+(var(--chart-y)-50)*1cqmin)]"

/** The keyboard and screen reader layer: one tab stop, arrow keys between points. */
function ChartPoints({ className, ...props }: ChartPart<"points">) {
  return usePart(
    chart,
    "points",
    {},
    {
      ...props,
      className: withClass("absolute inset-0 outline-none", className),
      children: (state) => state.categories.map((key) => <ChartPoint key={key} value={key} />),
    },
    "div",
  )
}

function ChartPoint({ value, className, ...props }: { value: string } & Omit<ChartPart<"point">, "value">) {
  return usePart(
    chart,
    "point",
    { value },
    {
      ...props,
      className: withClass(
        cn(
          "absolute inset-y-0 left-[calc(var(--chart-x)*1%)] w-[calc(var(--chart-w)*1%)] outline-none",
          "group-data-[orientation=horizontal]/chart:group-data-[type=bar]/chart:inset-x-0 group-data-[orientation=horizontal]/chart:group-data-[type=bar]/chart:inset-y-auto group-data-[orientation=horizontal]/chart:group-data-[type=bar]/chart:top-[calc(var(--chart-x)*1%)] group-data-[orientation=horizontal]/chart:group-data-[type=bar]/chart:h-[calc(var(--chart-w)*1%)] group-data-[orientation=horizontal]/chart:group-data-[type=bar]/chart:w-auto",
          "group-data-[type=pie]/chart:inset-auto group-data-[type=pie]/chart:size-7 group-data-[type=pie]/chart:-translate-1/2 group-data-[type=donut]/chart:inset-auto group-data-[type=donut]/chart:size-7 group-data-[type=donut]/chart:-translate-1/2",
          onRing,
        ),
        className,
      ),
    },
    "div",
  )
}

/* A data attribute as props. A typed call rather than an inline `{ "data-…": … }`, which a part's props
   reject as an unknown key once a formatter flattens it into the object (Laravel's starter kit reformats
   every file on `composer update`). */
function dataAttribute<Name extends string, Value>(name: Name, value: Value) {
  return { [`data-${name}`]: value } as { [Key in `data-${Name}`]: Value }
}

/** Follows the active point. With no children it shows the category and each series' value,
    whose digits Roll. `indicator` picks the swatch: a dot, a line or a dashed line. */
function ChartTooltip({
  indicator = "dot",
  hideLabel = false,
  className,
  children,
  ...props
}: ChartPart<"tooltip"> & { indicator?: "dot" | "line" | "dashed"; hideLabel?: boolean }) {
  return usePart(
    chart,
    "tooltip",
    {},
    {
      ...props,
      ...dataAttribute("indicator", indicator),
      className: withClass(
        cn(
          "pointer-events-none absolute z-10 w-max",
          "left-[calc(var(--chart-x)*1%)] top-[calc(var(--chart-y)*1%)]",
          onRing,
          /* Beside the cursor, and swinging to its left near the right edge. Up and down it shifts by
             its own place: flush with the top of the plot at the top, the bottom at the bottom. */
          "[translate:14px_calc(var(--chart-y)*-1%)] origin-left data-[side=left]:[translate:calc(-100%-14px)_calc(var(--chart-y)*-1%)] data-[side=left]:origin-right",
          "scale-[0.86] opacity-0 blur-[5px] data-open:scale-100 data-open:opacity-100 data-open:blur-none",
          `[transition:left_calc(420ms*var(--kf-speed,1))_var(--ease-spring),top_calc(420ms*var(--kf-speed,1))_var(--ease-spring),translate_calc(420ms*var(--kf-speed,1))_var(--ease-spring),scale_calc(160ms*var(--kf-speed,1))_var(--ease-house),opacity_calc(160ms*var(--kf-speed,1))_var(--ease-house),filter_calc(160ms*var(--kf-speed,1))_var(--ease-house)]`,
          `data-open:[transition:left_calc(420ms*var(--kf-speed,1))_var(--ease-spring),top_calc(420ms*var(--kf-speed,1))_var(--ease-spring),translate_calc(420ms*var(--kf-speed,1))_var(--ease-spring),scale_calc(320ms*var(--kf-speed,1))_var(--ease-pop),opacity_calc(220ms*var(--kf-speed,1))_var(--ease-house),filter_calc(260ms*var(--kf-speed,1))_var(--ease-house)]`,
          "motion-reduce:transition-none",
        ),
        className,
      ),
      children:
        children ??
        ((state) => (
          <>
            {hideLabel || !state.title ? null : <ChartTooltipLabel>{state.title}</ChartTooltipLabel>}
            {state.rows.map((row) => (
              <ChartTooltipItem key={row.key} value={row.key}>
                <span data-indicator="" />
                <span>{row.label}</span>
                <Roll text={row.text} />
              </ChartTooltipItem>
            ))}
            {state.total ? (
              <ChartTooltipTotal>
                <span>Total</span>
                <Roll text={state.total.text} />
              </ChartTooltipTotal>
            ) : null}
          </>
        )),
    },
    "div",
  )
}

function ChartTooltipLabel(props: ChartPart<"tooltip-label">) {
  return usePart(chart, "tooltip-label", {}, props, "div")
}

/** The stack's total under the rows, when bars or areas are stacked. */
function ChartTooltipTotal(props: ChartPart<"tooltip-total">) {
  return usePart(chart, "tooltip-total", {}, props, "div")
}

function ChartTooltipItem({ value, ...props }: { value: string } & Omit<ChartPart<"tooltip-item">, "value">) {
  return usePart(chart, "tooltip-item", { value }, props, "div")
}

/* ---------------------------------------------------------------- legend */

/** The series as toggles: pressing one hides it (it collapses on the chart) or brings it back.
    `side` puts it above or below the plot. */
function ChartLegend({ side = "bottom", className, children, ...props }: ChartPart<"legend"> & { side?: "top" | "bottom" }) {
  return usePart(
    chart,
    "legend",
    {},
    {
      ...props,
      ...dataAttribute("side", side),
      className: withClass("flex flex-wrap [grid-area:bottom] data-[side=top]:[grid-area:top]", className),
      children: children ?? ((state) => state.items.map((item) => <ChartLegendItem key={item.value} value={item.value} />)),
    },
    "div",
  )
}

/** One series' toggle. With no children it shows the series' swatch and label. */
function ChartLegendItem({ value, className, children, ...props }: { value: string } & Omit<ChartPart<"legend-item", "button">, "value">) {
  return usePart(
    chart,
    "legend-item",
    { value },
    {
      ...props,
      className: withClass(
        cn(
          `inline-flex items-center transition-[scale,opacity] duration-[calc(240ms*var(--kf-speed,1))] ease-pop active:scale-[0.96] motion-reduce:transition-none`,
          `[&>[data-indicator]]:transition-[scale,background-color,box-shadow] [&>[data-indicator]]:duration-[calc(320ms*var(--kf-speed,1))] [&>[data-indicator]]:ease-pop`,
          "data-hidden:[&>[data-indicator]]:scale-[0.7]",
        ),
        className,
      ),
      children:
        children ??
        ((state) => (
          <>
            <span data-indicator="" />
            {state.label}
          </>
        )),
    },
    "button",
  )
}

/* ---------------------------------------------------------------- table */

/** The numbers as a table, for screen readers. Visually hidden; drop the class to show it. */
function ChartTable({ className, ...props }: ChartPart<"table", "table">) {
  return usePart(
    chart,
    "table",
    {},
    {
      ...props,
      className: withClass("sr-only", className),
      children: (state) => (
        <>
          <thead>
            <tr>
              {state.head.map((cell, i) => (
                <th key={i} scope="col">
                  {cell}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {state.rows.map((row) => (
              <tr key={row.key}>
                {row.cells.map((cell, i) =>
                  i === 0 ? (
                    <th key={i} scope="row">
                      {cell}
                    </th>
                  ) : (
                    <td key={i}>{cell}</td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </>
      ),
    },
    "table",
  )
}

/* The donut's label rises in when it changes. */
function ChartKeyframes() {
  return (
    <style href="kf-chart" precedence="default">
      {"@keyframes kf-chart-rise{from{opacity:0;translate:0 6px;filter:blur(3px)}}"}
    </style>
  )
}

/* The root also brings the keyframes. */
function ChartRoot(props: ChartProps) {
  return (
    <>
      <ChartKeyframes />
      <Chart {...props} />
    </>
  )
}

export {
  ChartRoot as Chart,
  ChartArea,
  ChartBar,
  ChartCenter,
  ChartCursor,
  ChartDot,
  ChartGrid,
  ChartGridLine,
  ChartLegend,
  ChartLegendItem,
  ChartLine,
  ChartMarker,
  ChartMarks,
  ChartPlot,
  ChartPoint,
  ChartPoints,
  type ChartProps,
  ChartSlice,
  ChartTable,
  ChartTick,
  ChartTooltip,
  ChartTooltipItem,
  ChartTooltipLabel,
  ChartTooltipTotal,
  ChartXAxis,
  ChartYAxis,
  ChartRoot as ChartContainer,
  Roll,
}
export {
  type ChartConfig,
  type ChartCurve,
  type ChartDatum,
  type ChartOrientation,
  type ChartSeriesConfig,
  type ChartType,
} from "@/components/core/chart"
