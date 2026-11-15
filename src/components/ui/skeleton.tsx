"use client"

/* Styled skeleton: the animated primitive plus the Keyframery look. */

import * as React from "react"

import { Skeleton as SkeletonPrimitive, SkeletonSwap as SkeletonSwapPrimitive } from "@/components/primitives/skeleton"
import { cn } from "@/lib/utils"

/* A faint tint of the text colour, so it sits on any surface; in light mode the sweep is a band of
   the background colour, in dark mode a slightly lighter tint. */
function Skeleton({ className, ...props }: React.ComponentProps<typeof SkeletonPrimitive>) {
  return (
    <SkeletonPrimitive
      className={cn(
        "rounded-[8px] bg-foreground/[0.07] dark:bg-foreground/[0.08]",
        "[--kf-shimmer:color-mix(in_oklch,var(--background)_80%,transparent)] dark:[--kf-shimmer:color-mix(in_oklch,var(--foreground)_10%,transparent)]",
        className,
      )}
      {...props}
    />
  )
}

const SkeletonSwap = SkeletonSwapPrimitive

export { Skeleton, SkeletonSwap }
