"use client"

/* Animated drop-in for `@ui-sdk/react/radio`: same parts, same props. Swap the import and keep your code.
   This file adds motion only. Colours, radii, shadows and spacing stay yours. */

import {
  Radio as RadioPart,
  RadioGroup as RadioGroupPart,
  RadioIndicator as RadioIndicatorPart,
} from "@ui-sdk/react/radio"
import * as React from "react"

import { cn } from "@/lib/utils"

export * from "@ui-sdk/react/radio"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

/* Glide: one selection ring follows the checked radio from option to option, positioned with
   CSS anchors. By default it is a soft halo around the checked radio, `--kf-radio-pad` outside
   it; restyle it with `before:` classes. To ring a whole row instead, give the row
   `has-data-checked:[anchor-name:--kf-radio]` and the radio `data-checked:[anchor-name:none]`. */
function RadioGroup({ className, ...props }: React.ComponentProps<typeof RadioGroupPart>) {
  return (
    <RadioGroupPart
      className={withClass(
        cn(
          "relative isolate [anchor-scope:--kf-radio] [--kf-radio-pad:5px]",
          "before:pointer-events-none before:absolute before:-z-10 before:rounded-full before:content-['']",
          "before:bg-[color-mix(in_oklch,currentColor_9%,transparent)]",
          "before:[position-anchor:--kf-radio]",
          "before:top-[calc(anchor(top)-var(--kf-radio-pad))] before:right-[calc(anchor(right)-var(--kf-radio-pad))]",
          "before:bottom-[calc(anchor(bottom)-var(--kf-radio-pad))] before:left-[calc(anchor(left)-var(--kf-radio-pad))]",
          "before:transition-[top,right,bottom,left,opacity] before:duration-[calc(460ms*var(--kf-speed,1))] before:ease-spring",
          "not-has-data-checked:before:opacity-0",
          "motion-reduce:before:transition-none!",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* Press: gives under the finger, springs back. The checked radio is the anchor the ring follows. */
function Radio({ className, ...props }: React.ComponentProps<typeof RadioPart>) {
  return (
    <RadioPart
      className={withClass(
        cn(
          "data-checked:[anchor-name:--kf-radio]",
          "transition-[scale] duration-[calc(200ms*var(--kf-speed,1))] ease-pop motion-reduce:transition-none!",
          "not-data-disabled:not-data-readonly:active:scale-[0.86]",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* The dot pops in from 0.3 with an overshoot and shrinks away on the way out. */
function RadioIndicator({ className, ...props }: React.ComponentProps<typeof RadioIndicatorPart>) {
  return (
    <RadioIndicatorPart
      className={withClass(
        cn(
          "transition-[scale,opacity] duration-[calc(480ms*var(--kf-speed,1))] ease-pop",
          "data-starting-style:scale-[0.3] data-starting-style:opacity-0",
          "data-ending-style:scale-[0.4] data-ending-style:opacity-0 data-ending-style:duration-[calc(150ms*var(--kf-speed,1))] data-ending-style:ease-house",
          "motion-reduce:transition-none!",
        ),
        className,
      )}
      {...props}
    />
  )
}

export { Radio, RadioGroup, RadioIndicator }
