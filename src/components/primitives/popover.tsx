"use client"

/* Animated drop-in for `@ui-sdk/react/popover`: same parts, same props. Swap the import and keep
   your code. This file adds motion only. Colours, radii, shadows and spacing stay yours. */

import {
  PopoverClose as PopoverClosePart,
  PopoverContent as PopoverContentPart,
  PopoverTrigger as PopoverTriggerPart,
} from "@ui-sdk/react/popover"
import * as React from "react"

import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

export * from "@ui-sdk/react/popover"

/* Press: the key gives under the finger and springs back on release. It scales with --kf-flourish. */
const press =
  "transition-[scale] duration-[calc(200ms*var(--kf-speed,1))] ease-pop not-data-disabled:not-data-pending:active:scale-[calc(1-0.04*var(--kf-flourish,1))] motion-reduce:transition-none!"

/* Cascade: each direct child of the content rises in out of a blur a little after the one before
   it. A keyframe animation, since the children have no earlier style to transition from when the
   content first appears. Arrows and close buttons are left out. It scales with --kf-flourish: at 0
   the rows are simply there. */
const cascadeKeyframes = "@keyframes kf-cascade{from{opacity:0;translate:0 8px;filter:blur(4px)}}@media (prefers-reduced-motion:reduce){@keyframes kf-cascade{from{opacity:0}}}"

function PopoverTrigger({ className, ...props }: React.ComponentProps<typeof PopoverTriggerPart>) {
  return <PopoverTriggerPart className={withClass(press, className)} {...props} />
}

function PopoverClose({ className, ...props }: React.ComponentProps<typeof PopoverClosePart>) {
  return <PopoverClosePart className={withClass(press, className)} {...props} />
}

/* Unfold: the content grows out of its trigger from 0.86, 8px closer to it and out of a 6px blur,
   settling on a spring; then its rows cascade in. It leaves in 150ms, shrinking only a little.
   The blur and the grow beyond 0.95 scale with --kf-flourish; the fade, the 8px and 0.95 stay. */
function PopoverContent<Payload = unknown>({
  className,
  ...props
}: React.ComponentProps<typeof PopoverContentPart<Payload>>) {
  return (
    <>
      <style href="kf-cascade" precedence="default">
        {cascadeKeyframes}
      </style>
      <PopoverContentPart<Payload>
        className={withClass(
          cn(
            "origin-(--transform-origin) transition-[opacity,scale,translate,filter] duration-[calc(380ms*var(--kf-speed,1))] ease-spring",
            "data-[side=bottom]:[--kf-from:0_-8px] data-[side=left]:[--kf-from:8px_0] data-[side=right]:[--kf-from:-8px_0] data-[side=top]:[--kf-from:0_8px]",
            "data-starting-style:[translate:var(--kf-from,0_0)] data-starting-style:scale-[calc(0.95-0.09*var(--kf-flourish,1))] data-starting-style:opacity-0 data-starting-style:blur-[calc(6px*var(--kf-flourish,1))]",
            /* As a sheet it slides up from the bottom edge instead, so no unfold, blur or nudge toward a trigger. */
            "data-[presentation=sheet]:data-starting-style:scale-100 data-[presentation=sheet]:data-starting-style:blur-none data-[presentation=sheet]:data-starting-style:translate-none data-[presentation=sheet]:data-ending-style:scale-100 data-[presentation=sheet]:data-ending-style:blur-none data-[presentation=sheet]:data-ending-style:translate-none",
            "data-ending-style:scale-[0.96] data-ending-style:opacity-0 data-ending-style:blur-[calc(2px*var(--kf-flourish,1))] data-ending-style:duration-[calc(150ms*var(--kf-speed,1))] data-ending-style:ease-house",
            "[&>*:not([data-slot$=-close],[data-slot$=-arrow])]:animate-[kf-cascade_calc(420ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-spring)_backwards]",
            "[&>*:not([data-slot$=-close],[data-slot$=-arrow])]:[animation-delay:calc((calc(40ms*var(--kf-speed,1))+(min(sibling-index(),10)-1)*calc(40ms*var(--kf-speed,1)))*var(--kf-flourish,1))]",
            "motion-reduce:transition-none! motion-reduce:[&>*]:animate-none",
          ),
          className,
        )}
        {...props}
      />
    </>
  )
}

export { PopoverClose, PopoverContent, PopoverTrigger }
