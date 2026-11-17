"use client"

export * from "@/components/primitives/spinner"

/* Theming (unset variables keep the original appearance):
   --spinner-ink: Spinner colour (default: currentColor).
   --spinner-track: Ring track colour (default: currentColor).
   --spinner-ring-stroke: Ring thickness (default: 2.5).
   --spinner-spoke-stroke: Spoke thickness (default: 2.25).
   --spinner-diameter: Custom diameter (default: 14px / 16px / 24px by size).
   --spinner-opacity: Spinner opacity (default: 1).
   --spinner-track-opacity: Track opacity (default: 0.16).
   --spinner-cap: Stroke caps (default: round).
*/

/* Styled spinner: the animated primitive plus the Keyframery sizes. It takes the colour of the
   text around it, so it sits in a button, a row or a field without extra styling. */

import * as React from "react"

import { Spinner as SpinnerPrimitive } from "@/components/primitives/spinner"
import { Speed, type SpeedProps } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

/* `className` may be a string or a function of the part's state: keep both working. */
function withClass<C>(className: C, ...base: string[]): C {
  return (typeof className === "function"
    ? (state: unknown) => cn(...base, (className as (state: unknown) => string | undefined)(state))
    : cn(...base, className as string | undefined)) as C
}

type SpinnerSize = "sm" | "md" | "lg"

const sizes: Record<SpinnerSize, string> = {
  sm: "size-[var(--spinner-diameter,0.875rem)]",
  md: "size-[var(--spinner-diameter,1rem)]",
  lg: "size-[var(--spinner-diameter,1.5rem)]",
}

function Spinner({
  size = "md",
  speed,
  className,
  ...props
}: React.ComponentProps<typeof SpinnerPrimitive> & {
  /** `"sm"` (14px), `"md"` (16px, the default) or `"lg"` (24px). */
  size?: SpinnerSize
} & SpeedProps) {
  return (
    <Speed speed={speed}>
      <SpinnerPrimitive className={withClass(className, sizes[size],
        "text-[color:var(--spinner-ink,currentColor)] opacity-[var(--spinner-opacity,1)]",
        "[&_circle]:[stroke-width:var(--spinner-ring-stroke,2.5)] [&_line]:[stroke-width:var(--spinner-spoke-stroke,2.25)]",
        "[&_circle:first-child]:[stroke:var(--spinner-track,currentColor)] [&_circle:first-child]:opacity-[var(--spinner-track-opacity,0.16)]",
        "[&_circle+circle]:[stroke-linecap:var(--spinner-cap,round)] [&_line]:[stroke-linecap:var(--spinner-cap,round)]")} {...props} />
    </Speed>
  )
}

export { Spinner, type SpinnerSize }
