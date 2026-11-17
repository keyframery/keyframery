"use client"

/* Animated drop-in for `@ui-sdk/react/scroll-area`: same parts, same props. Swap the import and keep your code.
   This file adds motion only. Colours, radii, shadows and spacing stay yours.
   - The scrollbar fades in when it should show, and its thumb slides in from the edge.
   - The thumb is slim at rest and thickens on a spring while the pointer is on its track or it is
     dragged. Give the thumb its full (hovered) thickness; at rest it is drawn at half. A
     `data-hovered` attribute on the scrollbar thickens it too, for scripted demos. */

import {
  ScrollAreaScrollbar as ScrollAreaScrollbarPart,
  ScrollAreaThumb as ScrollAreaThumbPart,
} from "@ui-sdk/react/scroll-area"
import * as React from "react"

import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

export * from "@ui-sdk/react/scroll-area"

function ScrollAreaScrollbar({ className, ...props }: React.ComponentProps<typeof ScrollAreaScrollbarPart>) {
  return (
    <ScrollAreaScrollbarPart
      className={withClass(
        cn(
          "group/kf-scrollbar opacity-0 transition-opacity duration-[calc(420ms*var(--kf-speed,1))] ease-house",
          "data-visible:opacity-100 data-visible:duration-[calc(240ms*var(--kf-speed,1))]",
          "motion-reduce:transition-none!",
        ),
        className,
      )}
      {...props}
    />
  )
}

function ScrollAreaThumb({ className, ...props }: React.ComponentProps<typeof ScrollAreaThumbPart>) {
  return (
    <ScrollAreaThumbPart
      className={withClass(
        cn(
          "[transition:scale_calc(380ms*var(--kf-speed,1))_var(--ease-spring),translate_calc(420ms*var(--kf-speed,1))_var(--ease-spring),opacity_calc(240ms*var(--kf-speed,1))_var(--ease-house),background-color_calc(150ms*var(--kf-speed,1))_var(--ease-house)]",
          /* Slim at rest, from the outer edge. */
          "[--kf-thin:0.5] group-hover/kf-scrollbar:[--kf-thin:1] group-data-hovered/kf-scrollbar:[--kf-thin:1] data-dragging:[--kf-thin:1]",
          "data-[orientation=vertical]:origin-right data-[orientation=vertical]:[scale:var(--kf-thin)_1]",
          "data-[orientation=horizontal]:origin-bottom data-[orientation=horizontal]:[scale:1_var(--kf-thin)]",
          /* Out of sight, it waits a few pixels past the edge. */
          "group-not-data-visible/kf-scrollbar:opacity-0",
          "group-not-data-visible/kf-scrollbar:data-[orientation=vertical]:translate-x-1.5 group-not-data-visible/kf-scrollbar:data-[orientation=horizontal]:translate-y-1.5",
          "motion-reduce:[transition:none]!",
        ),
        className,
      )}
      {...props}
    />
  )
}

export { ScrollAreaScrollbar, ScrollAreaThumb }
