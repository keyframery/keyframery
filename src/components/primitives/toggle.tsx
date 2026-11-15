"use client"

/* Animated drop-in for `@ui-sdk/react/toggle`: same parts, same props. Swap the import and keep your code.
   This file adds motion only. Colours, radii, shadows and spacing stay yours. */

import { Toggle as TogglePart, ToggleGroup as ToggleGroupPart } from "@ui-sdk/react/toggle"
import * as React from "react"

import { cn } from "@/lib/utils"

export * from "@ui-sdk/react/toggle"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

/* Press, and the pressed surface pops: it lives on `before:`, grows from 0.7 with an
   overshoot when the toggle is pressed and shrinks away when it is released. Its neutral
   default follows the text colour; restyle it with `before:` classes. */
function Toggle({ className, ...props }: React.ComponentProps<typeof TogglePart>) {
  return (
    <TogglePart
      className={withClass(
        cn(
          "relative isolate transition-[scale] duration-[calc(200ms*var(--kf-speed,1))] ease-pop not-data-disabled:active:scale-[0.94]",
          "before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:rounded-[inherit] before:content-['']",
          "before:bg-[color-mix(in_oklch,currentColor_9%,transparent)]",
          "before:scale-[0.7] before:opacity-0",
          "before:[transition:scale_calc(160ms*var(--kf-speed,1))_var(--ease-house),opacity_calc(120ms*var(--kf-speed,1))_var(--ease-house)]",
          "data-pressed:before:scale-100 data-pressed:before:opacity-100",
          "data-pressed:before:[transition:scale_calc(420ms*var(--kf-speed,1))_var(--ease-pop),opacity_calc(120ms*var(--kf-speed,1))_var(--ease-house)]",
          "motion-reduce:transition-none! motion-reduce:before:[transition:none]!",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* Glide: one hover highlight moves between the toggles of a group, positioned with CSS
   anchors, instead of each toggle lighting up on its own. Restyle it with `before:` classes. */
function ToggleGroup({ className, ...props }: React.ComponentProps<typeof ToggleGroupPart>) {
  return (
    <ToggleGroupPart
      className={withClass(
        cn(
          "relative isolate [anchor-scope:--kf-toggle]",
          "[&>[data-slot=toggle]:not([data-disabled]):hover]:[anchor-name:--kf-toggle]",
          "before:pointer-events-none before:absolute before:-z-20 before:rounded-[9px] before:content-['']",
          "before:bg-[color-mix(in_oklch,currentColor_7%,transparent)]",
          "before:[position-anchor:--kf-toggle] before:top-[anchor(top)] before:right-[anchor(right)] before:bottom-[anchor(bottom)] before:left-[anchor(left)]",
          "before:opacity-0 before:transition-[top,right,bottom,left,opacity] before:duration-[calc(260ms*var(--kf-speed,1))] before:ease-spring",
          "has-[>[data-slot=toggle]:not([data-disabled]):hover]:before:opacity-100",
          "motion-reduce:before:transition-none!",
        ),
        className,
      )}
      {...props}
    />
  )
}

export { Toggle, ToggleGroup }
