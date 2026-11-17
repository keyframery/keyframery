"use client"

/* Animated drop-in for `@ui-sdk/react/timeline`: same parts, same props. Swap the import and keep your code.
   This file adds motion only. Colours, radii, shadows and spacing stay yours.

   - Cascade: events rise in one after another, with a blur, when the timeline first appears.
   - Draw: when a step completes, its marker pops and the strokes of its icon draw themselves. Set
     `--kf-draw` on the marker to your icon's path length (24 by default, right for a 24px check).
   - The rail fills: a finished step's connector fills from its marker toward the next one. The fill is
     the connector's `after:`; give it your own colour with `after:` classes. */

import {
  TimelineConnector as TimelineConnectorPart,
  TimelineItem as TimelineItemPart,
  TimelineMarker as TimelineMarkerPart,
} from "@ui-sdk/react/timeline"
import * as React from "react"

import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

export * from "@ui-sdk/react/timeline"

const keyframes =
  "@keyframes kf-timeline-pop{from{scale:.6}}" +
  "@keyframes kf-timeline-draw{from{stroke-dashoffset:var(--kf-draw,24)}to{stroke-dashoffset:0}}"

/* Only opacity, translate and filter transition here, so the stagger never slows anything else. */
function TimelineItem({ className, ...props }: React.ComponentProps<typeof TimelineItemPart>) {
  return (
    <TimelineItemPart
      className={withClass(
        cn(
          "transition-[opacity,translate,filter] duration-[calc(420ms*var(--kf-speed,1))] ease-spring [transition-delay:calc((min(sibling-index(),10)-1)*calc(32ms*var(--kf-speed,1)))]",
          "starting:translate-y-2 starting:opacity-0 starting:blur-[4px]",
          "motion-reduce:transition-none!",
        ),
        className,
      )}
      {...props}
    />
  )
}

function TimelineMarker({ className, ...props }: React.ComponentProps<typeof TimelineMarkerPart>) {
  return (
    <>
      <style href="kf-timeline" precedence="default">
        {keyframes}
      </style>
      <TimelineMarkerPart
        className={withClass(
          cn(
            "motion-reduce:animate-none! motion-reduce:[&_path]:animate-none! data-complete:animate-[kf-timeline-pop_calc(420ms*var(--kf-speed,1))_var(--ease-pop)]",
            "data-complete:[&_path]:[stroke-dasharray:var(--kf-draw,24)] data-complete:[&_path]:animate-[kf-timeline-draw_calc(260ms*var(--kf-speed,1))_var(--ease-house)_calc(140ms*var(--kf-speed,1))_both]",
            "motion-reduce:animate-none! motion-reduce:[&_path]:animate-none",
          ),
          className,
        )}
        {...props}
      />
    </>
  )
}

/* The fill grows along the connector once its step is complete, a moment after the check. */
function TimelineConnector({ className, ...props }: React.ComponentProps<typeof TimelineConnectorPart>) {
  return (
    <TimelineConnectorPart
      className={withClass(
        cn(
          "overflow-hidden",
          "after:absolute after:inset-0 after:origin-top after:scale-y-0 after:content-['']",
          "after:bg-[color-mix(in_oklch,currentColor_35%,transparent)]",
          "data-[orientation=horizontal]:after:origin-left data-[orientation=horizontal]:after:scale-x-0 data-[orientation=horizontal]:after:scale-y-100",
          "data-complete:after:scale-100",
          "after:transition-[scale] after:delay-[calc(200ms*var(--kf-speed,1))] after:duration-[calc(600ms*var(--kf-speed,1))] after:ease-house motion-reduce:after:transition-none!",
        ),
        className,
      )}
      {...props}
    />
  )
}

export { TimelineConnector, TimelineItem, TimelineMarker }
