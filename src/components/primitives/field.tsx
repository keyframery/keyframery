"use client"

/* Animated drop-in for `@ui-sdk/react/field`: same parts, same props. Swap the import and keep your code.
   This file adds motion only. Colours, radii, shadows and spacing stay yours. */

import {
  FieldControl as FieldControlPart,
  FieldError as FieldErrorPart,
} from "@ui-sdk/react/field"
import * as React from "react"

import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

export * from "@ui-sdk/react/field"

/* The focus ring is the outline. It starts 10px out and 0px wide and closes in onto the
   control on a spring, easing from its resting colour to its focus colour as it lands, while the
   hairline (a box-shadow) changes colour on a short clock of its own. On blur it lets go fast.
   Give the outline a strong colour at rest and a soft one on focus, for example
   `outline-ring focus-visible:outline-[3px] focus-visible:outline-ring/30`. */
function FieldControl({ className, ...props }: React.ComponentProps<typeof FieldControlPart>) {
  return (
    <FieldControlPart
      className={withClass(
        cn(
          "outline-offset-[10px] focus-visible:outline-offset-0",
          "[transition:outline-offset_calc(160ms*var(--kf-speed,1))_var(--ease-house),outline-width_calc(160ms*var(--kf-speed,1))_var(--ease-house),outline-color_0s_linear_calc(160ms*var(--kf-speed,1)),box-shadow_calc(150ms*var(--kf-speed,1))_var(--ease-house),background-color_calc(150ms*var(--kf-speed,1))_var(--ease-house)] focus-visible:[transition:outline-offset_calc(900ms*var(--kf-speed,1))_var(--ease-spring),outline-width_calc(900ms*var(--kf-speed,1))_var(--ease-spring),outline-color_calc(700ms*var(--kf-speed,1))_var(--ease-house),box-shadow_calc(150ms*var(--kf-speed,1))_var(--ease-house),background-color_calc(150ms*var(--kf-speed,1))_var(--ease-house)]",
          "motion-reduce:[transition:none]!",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* The error is only in the page while it shows. It opens its own height (so the fields
   below slide down instead of jumping) and rises 16px into place out of a blur. */
function FieldError({ className, ...props }: React.ComponentProps<typeof FieldErrorPart>) {
  return (
    <FieldErrorPart
      className={withClass(
        cn(
          "overflow-hidden [interpolate-size:allow-keywords]",
          "[transition:height_calc(520ms*var(--kf-speed,1))_var(--ease-house),margin_calc(520ms*var(--kf-speed,1))_var(--ease-house),opacity_calc(420ms*var(--kf-speed,1))_var(--ease-house),translate_calc(760ms*var(--kf-speed,1))_var(--ease-spring),filter_calc(520ms*var(--kf-speed,1))_var(--ease-house)]",
          "starting:h-0 starting:translate-y-4 starting:opacity-0 starting:blur-[4px]",
          "motion-reduce:[transition:none]!",
        ),
        className,
      )}
      {...props}
    />
  )
}

export { FieldControl, FieldError }
