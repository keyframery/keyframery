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

/* Press: the key gives under the finger and springs back on release. */
const press =
  "transition-[scale] duration-[calc(200ms*var(--kf-speed,1))] ease-pop not-data-disabled:not-data-pending:active:scale-[0.96] motion-reduce:transition-none!"

/* Cascade: each direct child of the content rises in out of a blur a little after the one before
   it. A keyframe animation, since the children have no earlier style to transition from when the
   content first appears. Arrows and close buttons are left out. */
const cascadeKeyframes = "@keyframes kf-cascade{from{opacity:0;translate:0 8px;filter:blur(4px)}}@media (prefers-reduced-motion:reduce){@keyframes kf-cascade{from{opacity:0}}}"

function PopoverTrigger({ className, ...props }: React.ComponentProps<typeof PopoverTriggerPart>) {
  return <PopoverTriggerPart className={withClass(press, className)} {...props} />
}

function PopoverClose({ className, ...props }: React.ComponentProps<typeof PopoverClosePart>) {
  return <PopoverClosePart className={withClass(press, className)} {...props} />
}

/* Unfold: the content grows out of its trigger from 0.86, 8px closer to it and out of a 6px blur,
   settling on a spring; then its rows cascade in. It leaves in 150ms, shrinking only a little. */
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
            "data-starting-style:[translate:var(--kf-from,0_0)] data-starting-style:scale-[0.86] data-starting-style:opacity-0 data-starting-style:blur-[6px]",
            "data-ending-style:scale-[0.96] data-ending-style:opacity-0 data-ending-style:blur-[2px] data-ending-style:duration-[calc(150ms*var(--kf-speed,1))] data-ending-style:ease-house",
            "[&>*:not([data-slot$=-close],[data-slot$=-arrow])]:animate-[kf-cascade_calc(420ms*var(--kf-speed,1))_var(--ease-spring)_backwards]",
            "[&>*:not([data-slot$=-close],[data-slot$=-arrow])]:[animation-delay:calc(calc(40ms*var(--kf-speed,1))+(min(sibling-index(),10)-1)*calc(40ms*var(--kf-speed,1)))]",
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
