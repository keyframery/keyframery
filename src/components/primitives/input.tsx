"use client"

/* Animated drop-in for `@ui-sdk/react/input`: same parts, same props. Swap the import and keep your code.
   This file adds motion only. Colours, radii, shadows and spacing stay yours. */

import {
  Input as InputPart,
  InputClear as InputClearPart,
  InputGroup as InputGroupPart,
} from "@ui-sdk/react/input"
import * as React from "react"

import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

export * from "@ui-sdk/react/input"

/* The focus ring is the outline. It starts 10px out and 0px wide and closes in onto the field
   on a spring, easing from its resting colour to its focus colour as it lands, while the hairline
   (a box-shadow) changes colour on a short clock of its own. On blur it lets go fast. Give the
   outline a strong colour at rest and a soft one on focus: `outline-ring focus-visible:outline-[3px] focus-visible:outline-ring/30`.
   The 10px close-in and the long spring scale with --kf-flourish; at 0 the ring simply fades on. */
const ringMotion =
  "outline-offset-[calc(10px*var(--kf-flourish,1))] " +
  "[transition:outline-offset_calc(160ms*var(--kf-speed,1))_var(--ease-house),outline-width_calc(160ms*var(--kf-speed,1))_var(--ease-house),outline-color_0s_linear_calc(160ms*var(--kf-speed,1)),box-shadow_calc(150ms*var(--kf-speed,1))_var(--ease-house),background-color_calc(150ms*var(--kf-speed,1))_var(--ease-house)] " +
  "motion-reduce:[transition:none]!"

function Input({ className, ...props }: React.ComponentProps<typeof InputPart>) {
  return (
    <InputPart className={withClass(
      cn(
        ringMotion, "focus-visible:outline-offset-0 focus-visible:[transition:outline-offset_calc((150ms+750ms*var(--kf-flourish,1))*var(--kf-speed,1))_var(--ease-spring),outline-width_calc((150ms+750ms*var(--kf-flourish,1))*var(--kf-speed,1))_var(--ease-spring),outline-color_calc((150ms+550ms*var(--kf-flourish,1))*var(--kf-speed,1))_var(--ease-house),box-shadow_calc(150ms*var(--kf-speed,1))_var(--ease-house),background-color_calc(150ms*var(--kf-speed,1))_var(--ease-house)]",
      ),
      className,
    )} {...props} />
  )
}

/* In a group the ring belongs to the group and follows the input's focus. */
function InputGroup({ className, ...props }: React.ComponentProps<typeof InputGroupPart>) {
  return (
    <InputGroupPart
      className={withClass(
        cn(
          ringMotion, "has-[input:focus-visible]:outline-offset-0 has-[input:focus-visible]:[transition:outline-offset_calc((150ms+750ms*var(--kf-flourish,1))*var(--kf-speed,1))_var(--ease-spring),outline-width_calc((150ms+750ms*var(--kf-flourish,1))*var(--kf-speed,1))_var(--ease-spring),outline-color_calc((150ms+550ms*var(--kf-flourish,1))*var(--kf-speed,1))_var(--ease-house),box-shadow_calc(150ms*var(--kf-speed,1))_var(--ease-house),background-color_calc(150ms*var(--kf-speed,1))_var(--ease-house)]",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* Only in the page while there is text to clear: it pops in, and presses with a pop release.
   The pop (scale, turn) and the press scale with --kf-flourish; at 0 it fades in. */
function InputClear({ className, ...props }: React.ComponentProps<typeof InputClearPart>) {
  return (
    <InputClearPart
      className={withClass(
        cn(
          "[transition:scale_calc(300ms*var(--kf-speed,1))_var(--ease-pop),opacity_calc(200ms*var(--kf-speed,1))_var(--ease-house),rotate_calc(300ms*var(--kf-speed,1))_var(--ease-pop),color_calc(150ms*var(--kf-speed,1)),background-color_calc(150ms*var(--kf-speed,1))]",
          "starting:scale-[calc(1-0.5*var(--kf-flourish,1))] starting:rotate-[calc(-45deg*var(--kf-flourish,1))] starting:opacity-0 active:scale-[calc(1-0.15*var(--kf-flourish,1))]",
          "motion-reduce:[transition:none]!",
        ),
        className,
      )}
      {...props}
    />
  )
}

export { Input, InputClear, InputGroup }
