"use client"

/* Animated drop-in for `@ui-sdk/react/checkbox`: same parts, same props. Swap the import and keep your code.
   This file adds motion only. Colours, radii, shadows and spacing stay yours. */

import {
  Checkbox as CheckboxPart,
  CheckboxIndicator as CheckboxIndicatorPart,
} from "@ui-sdk/react/checkbox"
import * as React from "react"

import { cn } from "@/lib/utils"

export * from "@ui-sdk/react/checkbox"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

/* Press: the box gives under the finger and springs back on release. */
function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPart>) {
  return (
    <CheckboxPart
      className={withClass(
        cn(
          "transition-[scale] duration-[calc(200ms*var(--kf-speed,1))] ease-pop motion-reduce:transition-none!",
          "not-data-disabled:not-data-readonly:active:scale-[0.86]",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* The indicator pops in from 0.6 with an overshoot and shrinks away on the way out.
   Any stroke inside it draws itself once it appears, a beat after the pop: with your own
   icon (24px strokes) nothing else is needed; for paths with pathLength={1}, set
   `[--kf-dash:1]` on the indicator. */
function CheckboxIndicator({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxIndicatorPart>) {
  return (
    <CheckboxIndicatorPart
      className={withClass(
        cn(
          "transition-[scale,opacity] duration-[calc(480ms*var(--kf-speed,1))] ease-pop",
          "data-starting-style:scale-[0.5] data-starting-style:opacity-0",
          "data-ending-style:scale-[0.6] data-ending-style:opacity-0 data-ending-style:duration-[calc(150ms*var(--kf-speed,1))] data-ending-style:ease-house",
          "[&_:is(path,line,polyline)]:[stroke-dasharray:var(--kf-dash,30)] [&_:is(path,line,polyline)]:[stroke-dashoffset:0]",
          "[&_:is(path,line,polyline)]:starting:[stroke-dashoffset:var(--kf-dash,30)]",
          "[&_:is(path,line,polyline)]:[transition:stroke-dashoffset_calc(260ms*var(--kf-speed,1))_var(--ease-house)_calc(70ms*var(--kf-speed,1))]",
          "motion-reduce:transition-none! motion-reduce:[&_:is(path,line,polyline)]:[transition:none]",
        ),
        className,
      )}
      {...props}
    />
  )
}

export { Checkbox, CheckboxIndicator }
