"use client"

/* Animated drop-in for `@ui-sdk/react/waterfall`: same parts, same props. Swap the import and keep your
   code. This file adds motion only. Colours, radii, shadows and spacing stay yours. */

import {
  WaterfallAxis as WaterfallAxisPart,
  WaterfallBar as WaterfallBarPart,
  WaterfallIndicator as WaterfallIndicatorPart,
  WaterfallMark as WaterfallMarkPart,
  WaterfallRow as WaterfallRowPart,
  WaterfallTick as WaterfallTickPart,
} from "@ui-sdk/react/waterfall"
import * as React from "react"

import { cn } from "@/lib/utils"

export * from "@ui-sdk/react/waterfall"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

/* Keyframes rather than transitions: a row has no earlier state when it mounts, or when a collapsed
   span opens and its hidden rows show again. Both replay the animation. */
const keyframes = [
  "@keyframes kf-waterfall-row{from{opacity:0;translate:0 6px;filter:blur(3px)}}",
  "@keyframes kf-waterfall-bar{from{scale:0 1}}",
  "@keyframes kf-waterfall-mark{from{opacity:0;clip-path:inset(0 0 100% 0)}}",
].join("")

/* Cascade: each row rises in a little after the one before it among its siblings, so opening a
   span cascades its children from the first one. The place comes from the row's own
   `aria-posinset`; where a browser can't read it, every row simply arrives at once. */
function WaterfallRow({ className, ...props }: React.ComponentProps<typeof WaterfallRowPart>) {
  return (
    <>
      <style href="kf-waterfall" precedence="default">
        {keyframes}
      </style>
      <WaterfallRowPart
        className={withClass(
          cn(
            "[--kf-wf-i:attr(aria-posinset_type(<integer>),1)]",
            "[--kf-wf-delay:calc((min(var(--kf-wf-i),10)-1)*calc(36ms*var(--kf-speed,1)))]",
            "animate-[kf-waterfall-row_calc(420ms*var(--kf-speed,1))_var(--ease-spring)_backwards] [animation-delay:var(--kf-wf-delay)]",
            "motion-reduce:animate-none!",
          ),
          className,
        )}
        {...props}
      />
    </>
  )
}

/* The bar grows left to right from where its span starts, on a spring, just after its row arrives.
   When the range changes (a zoom, or new timings) it glides to its new place and length. It is
   drawn by `::before`, placed by `--waterfall-start` and `--waterfall-size`, with a neutral
   default surface you can restyle with `before:` classes. */
function WaterfallBar({ className, ...props }: React.ComponentProps<typeof WaterfallBarPart>) {
  return (
    <WaterfallBarPart
      className={withClass(
        cn(
          "relative",
          "before:absolute before:inset-y-2 before:start-(--waterfall-start) before:w-(--waterfall-size) before:min-w-0.5 before:content-['']",
          "before:bg-[color-mix(in_oklch,currentColor_40%,transparent)]",
          "before:origin-left rtl:before:origin-right",
          "before:animate-[kf-waterfall-bar_calc(620ms*var(--kf-speed,1))_var(--ease-spring)_backwards]",
          "before:[animation-delay:calc(var(--kf-wf-delay,0ms)+calc(90ms*var(--kf-speed,1)))]",
          "before:transition-[inset-inline-start,width] before:duration-[calc(560ms*var(--kf-speed,1))] before:ease-spring",
          "motion-reduce:before:animate-none! motion-reduce:before:transition-none!",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* The chevron turns on a spring as its span opens. */
function WaterfallIndicator({ className, ...props }: React.ComponentProps<typeof WaterfallIndicatorPart>) {
  return (
    <WaterfallIndicatorPart
      className={withClass(
        cn(
          "transition-[rotate] duration-[calc(380ms*var(--kf-speed,1))] ease-spring data-expanded:rotate-90 rtl:data-expanded:-rotate-90",
          "motion-reduce:transition-none!",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* The mark glides to its new moment when the time changes or the range moves, draws down when it
   first appears, and fades while its moment is outside the range. */
function WaterfallMark({ className, ...props }: React.ComponentProps<typeof WaterfallMarkPart>) {
  return (
    <WaterfallMarkPart
      className={withClass(
        cn(
          "absolute start-(--waterfall-mark)",
          "transition-[inset-inline-start,opacity] duration-[calc(560ms*var(--kf-speed,1))] ease-spring data-outside:opacity-0",
          "animate-[kf-waterfall-mark_calc(520ms*var(--kf-speed,1))_var(--ease-house)_calc(240ms*var(--kf-speed,1))_backwards]",
          "motion-reduce:animate-none! motion-reduce:transition-none!",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* Ticks sit at their time on the axis and glide when the range moves. */
function WaterfallTick({ className, ...props }: React.ComponentProps<typeof WaterfallTickPart>) {
  return (
    <WaterfallTickPart
      className={withClass(
        cn(
          "absolute start-(--waterfall-tick)",
          "transition-[inset-inline-start] duration-[calc(560ms*var(--kf-speed,1))] ease-spring motion-reduce:transition-none!",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* Same as UI SDK's axis, but its default ticks are the gliding ones above. */
function WaterfallAxis({ children, ...props }: React.ComponentProps<typeof WaterfallAxisPart>) {
  return (
    <WaterfallAxisPart {...props}>
      {children ?? ((state) => state.ticks.map((tick) => <WaterfallTick key={tick.time} time={tick.time} />))}
    </WaterfallAxisPart>
  )
}

export { WaterfallAxis, WaterfallBar, WaterfallIndicator, WaterfallMark, WaterfallRow, WaterfallTick }
