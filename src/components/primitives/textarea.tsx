"use client"

/* Animated drop-in for `@ui-sdk/react/textarea`: same parts, same props. Swap the import and keep your code.
   This file adds motion only. Colours, radii, shadows and spacing stay yours. */

import { Textarea as TextareaPart } from "@ui-sdk/react/textarea"
import * as React from "react"

import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

export * from "@ui-sdk/react/textarea"

/* The focus ring is the outline. It starts 10px out and 0px wide and closes in onto the box
   on a spring, easing from its resting colour to its focus colour as it lands. On blur it lets
   go fast. Give the outline a strong colour at rest and a soft one on focus: `outline-ring focus-visible:outline-[3px] focus-visible:outline-ring/30`. */
function Textarea({ className, ...props }: React.ComponentProps<typeof TextareaPart>) {
  return (
    <TextareaPart
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

export { Textarea }
