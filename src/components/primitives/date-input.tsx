"use client"

/* Animated drop-in for `@ui-sdk/react/date-input`: same parts, same props. Swap the import and keep your code.
   This file adds motion only. Colours, radii, shadows and spacing stay yours.

   Glide: one highlight sits under the segment with focus and glides to the next segment as focus
   moves, typed or tabbed. It is the root's `before:`; give it your own colour and radius with
   `before:` classes on DateInput. */

import { DateInput as DateInputRoot, DateInputSegment as DateInputSegmentPart } from "@ui-sdk/react/date-input"
import * as React from "react"

import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

export * from "@ui-sdk/react/date-input"

function DateInput({ className, children, ...props }: React.ComponentProps<typeof DateInputRoot>) {
  return (
    <DateInputRoot
      className={withClass(
        cn(
          "relative isolate [anchor-scope:--kf-seg,--kf-seg-rest]",
          "before:pointer-events-none before:absolute before:-z-10 before:opacity-0 before:content-[''] before:[position-anchor:--kf-seg]",
          "before:bg-[color-mix(in_oklch,currentColor_9%,transparent)]",
          "before:top-[anchor(--kf-seg_top,anchor(--kf-seg-rest_top))] before:right-[anchor(--kf-seg_right,anchor(--kf-seg-rest_right))]",
          "before:bottom-[anchor(--kf-seg_bottom,anchor(--kf-seg-rest_bottom))] before:left-[anchor(--kf-seg_left,anchor(--kf-seg-rest_left))]",
          "before:[transition:top_calc(280ms*var(--kf-speed,1))_var(--ease-spring),right_calc(280ms*var(--kf-speed,1))_var(--ease-spring),bottom_calc(280ms*var(--kf-speed,1))_var(--ease-spring),left_calc(280ms*var(--kf-speed,1))_var(--ease-spring),opacity_calc(160ms*var(--kf-speed,1))_var(--ease-house)]",
          "has-[input:focus]:before:opacity-100 motion-reduce:before:[transition:none]!",
        ),
        className,
      )}
      {...props}
    >
      {children ??
        ((state) =>
          state.segments.map((segment) => <DateInputSegment key={segment.key} segment={segment} />))}
    </DateInputRoot>
  )
}

/* The segment with focus names itself as the highlight's anchor. The first segment is a resting
   anchor: focus passes through "nothing focused" for a moment as it moves between segments, and
   without somewhere to rest the highlight would jump instead of gliding. */
function DateInputSegment({ className, ...props }: React.ComponentProps<typeof DateInputSegmentPart>) {
  return <DateInputSegmentPart className={withClass("first:[anchor-name:--kf-seg-rest] focus:[anchor-name:--kf-seg] first:focus:[anchor-name:--kf-seg,--kf-seg-rest]", className)} {...props} />
}

export { DateInput, DateInputSegment }
