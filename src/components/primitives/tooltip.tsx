"use client"

/* Animated drop-in for `@ui-sdk/react/tooltip`: same parts, same props. Swap the import and keep
   your code. This file adds motion only. Colours, radii, shadows and spacing stay yours. */

import {
  TooltipContent as TooltipContentPart,
  TooltipTrigger as TooltipTriggerPart,
} from "@ui-sdk/react/tooltip"
import * as React from "react"

import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

export * from "@ui-sdk/react/tooltip"

/* Press: a trigger gives under the finger and springs back on release. */
function TooltipTrigger({ className, ...props }: React.ComponentProps<typeof TooltipTriggerPart>) {
  return (
    <TooltipTriggerPart
      className={withClass("transition-[scale] duration-[calc(200ms*var(--kf-speed,1))] ease-pop not-data-disabled:active:scale-[0.96] motion-reduce:transition-none!", className)}
      {...props}
    />
  )
}

/* Unfold, small: the tip pops out of its trigger from 0.7, 8px closer to it, with a little
   overshoot. When it opens at once because a neighbour was just showing, it simply appears, so
   moving along a toolbar reads as one tip following the pointer. */
function TooltipContent<Payload = unknown>({
  className,
  ...props
}: React.ComponentProps<typeof TooltipContentPart<Payload>>) {
  return (
    <TooltipContentPart<Payload>
      className={withClass(
        cn(
          "origin-(--transform-origin) transition-[opacity,scale,translate,filter] duration-[calc(300ms*var(--kf-speed,1))] ease-pop",
          "data-[side=bottom]:[--kf-from:0_-8px] data-[side=left]:[--kf-from:8px_0] data-[side=right]:[--kf-from:-8px_0] data-[side=top]:[--kf-from:0_8px]",
          "data-starting-style:[translate:var(--kf-from,0_0)] data-starting-style:scale-[0.7] data-starting-style:opacity-0 data-starting-style:blur-[4px]",
          "data-ending-style:scale-[0.9] data-ending-style:opacity-0 data-ending-style:duration-[calc(150ms*var(--kf-speed,1))] data-ending-style:ease-house",
          "data-instant:transition-none",
          "motion-reduce:transition-none!",
        ),
        className,
      )}
      {...props}
    />
  )
}

export { TooltipContent, TooltipTrigger }
