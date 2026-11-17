"use client"

export * from "@/components/primitives/skeleton"

/* Styled skeleton: the animated primitive plus the Keyframery look. */

/* Theming: inherit these optional variables; unset values retain the original light/dark tokens.
   --skeleton-face: Placeholder fill (default: --foreground at 7%; 8% in dark).
   --skeleton-sweep: Shimmer band (default: --background at 80%; --foreground at 10% in dark).
   --skeleton-radius: Placeholder corners (default: 8px).
 */

import * as React from "react"

import { Skeleton as SkeletonPrimitive, SkeletonSwap as SkeletonSwapPrimitive } from "@/components/primitives/skeleton"
import { Speed, type SpeedProps } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

/* A faint tint of the text colour, so it sits on any surface; in light mode the sweep is a band of
   the background colour, in dark mode a slightly lighter tint. */
const look = cn(
  "rounded-[var(--skeleton-radius,8px)] bg-[var(--skeleton-face,color-mix(in_oklab,var(--foreground)_7%,transparent))] dark:bg-[var(--skeleton-face,color-mix(in_oklab,var(--foreground)_8%,transparent))]",
  "[--kf-shimmer:var(--skeleton-sweep,color-mix(in_oklch,var(--background)_80%,transparent))] dark:[--kf-shimmer:var(--skeleton-sweep,color-mix(in_oklch,var(--foreground)_10%,transparent))]",
)

function Skeleton({ speed, className, ...props }: React.ComponentProps<typeof SkeletonPrimitive> & SpeedProps) {
  return (
    <Speed speed={speed}>
      <SkeletonPrimitive
        className={typeof className === "function" ? (state) => cn(look, className(state)) : cn(look, className)}
        {...props}
      />
    </Speed>
  )
}

const SkeletonSwap = SkeletonSwapPrimitive

export { Skeleton, SkeletonSwap }
