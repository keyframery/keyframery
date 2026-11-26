"use client"

/* Animated sparkline, on UI SDK's core. UI SDK ships no sparkline, so the behaviour and the geometry
   are defined in `@/components/core/sparkline` with `definePrimitive` and rendered here. No charting
   library: the line and area are SVG in a 0–100 box, bars and dots are elements placed by CSS
   variables. This file adds the layout those variables need and the motion. Colours, radii and
   sizes stay yours; the marks draw in `--sparkline-tone` (falling back to the text colour).

   - Draw: a line draws itself from the left with its area unrolling under it; then the last point
     pops in. Bars Cascade: they grow from the baseline one after another, left to right.
   - Tween: new data moves the line, the area, every bar and the last point on a spring. Paths of any
     length up to 97 points tween into each other (see the core).
   - Glide: while someone scrubs, a hairline and a dot ride to the point under the pointer or the
     arrow keys, and the readout follows them with its value Rolling.
   - Flourish: the first draw, the bars' growth and cascade, the late pop of the dots, the rolls and the
     marker's and readout's grow scale with --kf-flourish; the tween and the glide stay.

   Every moving value is a CSS variable from the core (`--sparkline-x`, `--sparkline-y`,
   `--sparkline-w`, `--sparkline-h` in percent, `--sparkline-path`). */

import type { SlotName, StateOf } from "@ui-sdk/core"
import { type PartProps, usePart, usePrimitive } from "@ui-sdk/react/primitive"
import * as React from "react"

import { sparkline, type SparklineOptions } from "@/components/core/sparkline"
import { cn } from "@/lib/utils"

type SparklinePart<Slot extends SlotName<typeof sparkline>, Tag extends keyof React.JSX.IntrinsicElements = "div"> = PartProps<Tag, StateOf<typeof sparkline, Slot>>

/* UI SDK parts take a class name or a function of the part's state. Keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

/* ---------------------------------------------------------------- Roll */

/* Roll: every digit is a column of 0 to 9 that slides to its value on a spring. Positions are keyed
   from the right, so a new leading digit is added instead of everything shifting. */
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
              className="flex flex-col transition-[translate] duration-[calc(480ms*var(--kf-speed,1)*var(--kf-flourish,1))] ease-spring [translate:0_calc(var(--d)*-1lh)] motion-reduce:transition-none!"
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

type SparklineProps = SparklineOptions & Omit<SparklinePart<"root">, keyof SparklineOptions>

/** The sparkline. With no children it draws the plot with its marks, the last point and the
    readout. Name it with `label` and `period` (it reads "Revenue, last 14 days, up 12%"), or
    with your own `aria-label`. */
function Sparkline({
  data,
  labels,
  type,
  curve,
  label,
  period,
  formatValue,
  downIsGood,
  flatThreshold,
  reference,
  extremes,
  includeZero,
  activeIndex,
  defaultActiveIndex,
  onActiveIndexChange,
  className,
  children,
  ...props
}: SparklineProps) {
  const handle = usePrimitive(sparkline, {
    data,
    labels,
    type,
    curve,
    label,
    period,
    formatValue,
    downIsGood,
    flatThreshold,
    reference,
    extremes,
    includeZero,
    activeIndex,
    defaultActiveIndex,
    onActiveIndexChange,
  })
  return usePart(
    handle,
    "root",
    {},
    {
      ...props,
      className: withClass("group/sparkline relative isolate block min-w-0", className),
      children: children ?? <SparklinePlot />,
    },
    "div",
  )
}

/* ---------------------------------------------------------------- plot */

/** The marks' box, inset by `--sparkline-inset` (default 4px) so the dots at the ends stay inside.
    With no children: the reference line, the marks, the extremes, the cursor, the last point and
    the readout. The points (the keyboard layer) are always added. */
function SparklinePlot({ className, children, ...props }: SparklinePart<"plot">) {
  return usePart(
    sparkline,
    "plot",
    {},
    {
      ...props,
      className: withClass("absolute inset-[var(--sparkline-inset,4px)] touch-pan-y", className),
      children: (state) => (
        <>
          {typeof children === "function"
            ? children(state)
            : (children ?? (
                <>
                  <SparklineReference />
                  <SparklineCursor />
                  {state.type === "bar" ? <SparklineBars count={state.count} /> : <SparklineSvg />}
                  <SparklineExtreme value="max" />
                  <SparklineExtreme value="min" />
                  <SparklineMarker />
                  <SparklineEnd />
                  <SparklineReadout />
                </>
              ))}
          <SparklinePoints />
        </>
      ),
    },
    "div",
  )
}

/* ---------------------------------------------------------------- line and area */

/* The line draws itself from the left; it tweens to new values on a spring. The draw scales with
   --kf-flourish; the tween stays. */
const lineMotion = cn(
  "fill-none [d:var(--sparkline-path)] [vector-effect:non-scaling-stroke]",
  "[clip-path:inset(-50%_-6%_-50%_-6%)] starting:[clip-path:inset(-50%_106%_-50%_-6%)]",
  `[transition:d_calc(720ms*var(--kf-speed,1))_var(--ease-spring),clip-path_calc(900ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-house)]`,
  "motion-reduce:transition-none",
)

/** The SVG with the area's gradient, the area and the line. */
function SparklineSvg({ className, children, ...props }: SparklinePart<"svg", "svg">) {
  const id = React.useId().replace(/[^\w-]/g, "")
  return usePart(
    sparkline,
    "svg",
    {},
    {
      ...props,
      className: withClass("pointer-events-none absolute inset-0 size-full overflow-visible", className),
      children: children ?? (
        <>
          <defs>
            <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" style={{ stopColor: "var(--sparkline-tone,currentColor)", stopOpacity: "var(--sparkline-fill-top,0.24)" }} />
              <stop offset="1" style={{ stopColor: "var(--sparkline-tone,currentColor)", stopOpacity: "var(--sparkline-fill-bottom,0)" }} />
            </linearGradient>
          </defs>
          <SparklineArea fill={`url(#${id}-fill)`} />
          <SparklineLine />
        </>
      ),
    },
    "svg",
  )
}

/** The line. */
function SparklineLine({ className, ...props }: SparklinePart<"line", "path">) {
  return usePart(sparkline, "line", {}, { ...props, className: withClass(lineMotion, className) }, "path")
}

/** The fill under the line, for `type="area"`. Give it `fill`, as `SparklineSvg` does with a gradient. */
function SparklineArea({ className, ...props }: SparklinePart<"area", "path">) {
  return usePart(sparkline, "area", {}, { ...props, className: withClass(lineMotion.replace("fill-none ", ""), className) }, "path")
}

/* ---------------------------------------------------------------- bars */

/* Bars grow from the baseline one after another; the cascade takes about 520ms whatever the count.
   The growth on mount and the stagger scale with --kf-flourish; a new value still tweens. */
const barMotion = cn(
  "absolute left-[calc(var(--sparkline-x)*1%)] w-[calc(var(--sparkline-w)*1%)] bottom-[calc(var(--sparkline-y)*1%)] h-[calc(var(--sparkline-h)*1%)] starting:h-[calc(var(--sparkline-h)*1%*(1-var(--kf-flourish,1)))]",
  "data-negative:bottom-auto data-negative:top-[calc((100-var(--sparkline-y)-var(--sparkline-h))*1%)]",
  "data-dim:opacity-45",
  `transition-[left,width,bottom,top,height,opacity] duration-[calc(640ms*var(--kf-speed,1))] ease-spring`,
  `[transition-delay:calc(var(--sparkline-i,0)*calc(520ms*var(--kf-speed,1)*var(--kf-flourish,1))/var(--sparkline-n,1)),calc(var(--sparkline-i,0)*calc(520ms*var(--kf-speed,1)*var(--kf-flourish,1))/var(--sparkline-n,1)),calc(var(--sparkline-i,0)*calc(520ms*var(--kf-speed,1)*var(--kf-flourish,1))/var(--sparkline-n,1)),calc(var(--sparkline-i,0)*calc(520ms*var(--kf-speed,1)*var(--kf-flourish,1))/var(--sparkline-n,1)),calc(var(--sparkline-i,0)*calc(520ms*var(--kf-speed,1)*var(--kf-flourish,1))/var(--sparkline-n,1)),0ms]`,
  "motion-reduce:transition-none",
)

/** The bars, for `type="bar"`. */
function SparklineBars({ count, className, ...props }: { count: number } & React.ComponentProps<"div">) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0", className)} style={{ "--sparkline-n": Math.max(1, count) } as React.CSSProperties} {...props}>
      {Array.from({ length: count }, (_, i) => (
        <SparklineBar key={i} value={String(i)} />
      ))}
    </div>
  )
}

/** One bar, keyed by its index as a string. */
function SparklineBar({ value, className, ...props }: { value: string } & Omit<SparklinePart<"bar">, "value">) {
  return usePart(sparkline, "bar", { value }, { ...props, className: withClass(barMotion, className) }, "div")
}

/* ---------------------------------------------------------------- reference, extremes, end */

const pointBox = "absolute left-[calc(var(--sparkline-x)*1%)] top-[calc(var(--sparkline-y)*1%)] -translate-1/2"
const follow = `[transition:left_calc(720ms*var(--kf-speed,1))_var(--ease-spring),top_calc(720ms*var(--kf-speed,1))_var(--ease-spring),scale_calc(360ms*var(--kf-speed,1))_var(--ease-pop),opacity_calc(200ms*var(--kf-speed,1))_var(--ease-house)]`

/** The dashed line at `reference`. It glides when the value or the range changes. */
function SparklineReference({ className, ...props }: SparklinePart<"reference">) {
  return usePart(
    sparkline,
    "reference",
    {},
    {
      ...props,
      className: withClass(
        cn(
          "pointer-events-none absolute inset-x-0 top-[calc(var(--sparkline-y)*1%)] h-0 starting:opacity-[calc(1-var(--kf-flourish,1))]",
          `[transition:top_calc(720ms*var(--kf-speed,1))_var(--ease-spring),opacity_calc(400ms*var(--kf-speed,1))_var(--ease-house)] motion-reduce:transition-none`,
        ),
        className,
      ),
    },
    "div",
  )
}

/** A dot on the highest (`value="max"`) or lowest (`value="min"`) point, shown by `extremes`. */
function SparklineExtreme({ value, className, ...props }: { value: "max" | "min" } & Omit<SparklinePart<"extreme">, "value">) {
  return usePart(
    sparkline,
    "extreme",
    { value },
    {
      ...props,
      className: withClass(
        cn(
          pointBox,
          "pointer-events-none size-[var(--sparkline-dot,6px)] starting:scale-[calc(1-var(--kf-flourish,1))] starting:opacity-[calc(1-var(--kf-flourish,1))]",
          follow,
          `[transition-delay:0ms,0ms,calc(760ms*var(--kf-speed,1)*var(--kf-flourish,1)),calc(760ms*var(--kf-speed,1)*var(--kf-flourish,1))] motion-reduce:transition-none`,
        ),
        className,
      ),
    },
    "div",
  )
}

/** The last point. It pops in once the line has drawn up to it, and follows new data. On bars it
    marks nothing: the styled part colours the last bar instead. */
function SparklineEnd({ className, ...props }: SparklinePart<"end">) {
  return usePart(
    sparkline,
    "end",
    {},
    {
      ...props,
      className: withClass(
        cn(
          pointBox,
          "pointer-events-none size-[var(--sparkline-dot,6px)] starting:scale-[calc(1-var(--kf-flourish,1))] starting:opacity-[calc(1-var(--kf-flourish,1))] data-[type=bar]:hidden",
          "group-data-active/sparkline:scale-75 group-data-active/sparkline:opacity-50",
          follow,
          `[transition-delay:0ms,0ms,calc(820ms*var(--kf-speed,1)*var(--kf-flourish,1)),calc(820ms*var(--kf-speed,1)*var(--kf-flourish,1))] motion-reduce:transition-none`,
        ),
        className,
      ),
    },
    "div",
  )
}

/* ---------------------------------------------------------------- scrub */

const glide = `[transition:left_calc(320ms*var(--kf-speed,1))_var(--ease-spring),top_calc(320ms*var(--kf-speed,1))_var(--ease-spring),translate_calc(320ms*var(--kf-speed,1))_var(--ease-spring),scale_calc(300ms*var(--kf-speed,1))_var(--ease-pop),opacity_calc(160ms*var(--kf-speed,1))_var(--ease-house)]`

/** The hairline at the point being read. */
function SparklineCursor({ className, ...props }: SparklinePart<"cursor">) {
  return usePart(
    sparkline,
    "cursor",
    {},
    {
      ...props,
      className: withClass(
        cn("pointer-events-none absolute inset-y-0 left-[calc(var(--sparkline-x)*1%)] w-px -translate-x-1/2 opacity-0 data-open:opacity-100", glide, "motion-reduce:transition-none"),
        className,
      ),
    },
    "div",
  )
}

/** The dot that rides to the point being read, on lines and areas. */
function SparklineMarker({ className, ...props }: SparklinePart<"marker">) {
  return usePart(
    sparkline,
    "marker",
    {},
    {
      ...props,
      className: withClass(
        cn(pointBox, "pointer-events-none size-[calc(var(--sparkline-dot,6px)+2px)] scale-[calc(0.95-0.55*var(--kf-flourish,1))] opacity-0 data-open:scale-100 data-open:opacity-100", glide, "motion-reduce:transition-none"),
        className,
      ),
    },
    "div",
  )
}

/** The value under the pointer, above the plot. With no children it shows the point's label and
    its value, whose digits Roll. */
function SparklineReadout({ className, children, ...props }: SparklinePart<"readout">) {
  return usePart(
    sparkline,
    "readout",
    {},
    {
      ...props,
      className: withClass(
        cn(
          "pointer-events-none absolute bottom-[calc(100%+var(--sparkline-inset,4px)+6px)] left-[calc(var(--sparkline-x)*1%)] z-10 w-max",
          "[translate:-50%_0] data-[side=left]:[translate:calc(-100%+10px)_0] data-[side=right]:[translate:-10px_0]",
          "origin-bottom scale-[calc(0.95-0.25*var(--kf-flourish,1))] opacity-0 data-open:scale-100 data-open:opacity-100",
          glide,
          "motion-reduce:transition-none",
        ),
        className,
      ),
      children:
        children ??
        ((state) => (
          <>
            {state.label ? <span data-readout-label="">{state.label}</span> : null}
            <Roll text={state.text} />
          </>
        )),
    },
    "div",
  )
}

/** The keyboard and screen reader layer: one tab stop, arrow keys between points. */
function SparklinePoints({ className, ...props }: SparklinePart<"points">) {
  return usePart(
    sparkline,
    "points",
    {},
    {
      ...props,
      className: withClass("absolute inset-0 outline-none", className),
      children: (state) => state.keys.map((key) => <SparklinePoint key={key} value={key} />),
    },
    "div",
  )
}

function SparklinePoint({ value, className, ...props }: { value: string } & Omit<SparklinePart<"point">, "value">) {
  return usePart(
    sparkline,
    "point",
    { value },
    { ...props, className: withClass("absolute inset-y-0 left-[calc(var(--sparkline-x)*1%)] w-[calc(var(--sparkline-w)*1%)] outline-none", className) },
    "div",
  )
}

export {
  Roll,
  Sparkline,
  SparklineArea,
  SparklineBar,
  SparklineBars,
  SparklineCursor,
  SparklineEnd,
  SparklineExtreme,
  SparklineLine,
  SparklineMarker,
  SparklinePlot,
  SparklinePoint,
  SparklinePoints,
  type SparklineProps,
  SparklineReadout,
  SparklineReference,
  SparklineSvg,
}
export { percent, type SparklineCurve, type SparklineTone, type SparklineTrend, type SparklineType } from "@/components/core/sparkline"
