"use client"

/* Animated skeleton. UI SDK has no skeleton, so these are plain elements with shadcn's part name
   (Skeleton) plus a SkeletonSwap helper. This file adds motion only. Colours, radii and sizes stay yours. */

import * as React from "react"

import { cn } from "@/lib/utils"

/* The sweep crosses, then rests a moment before the next one. */
const keyframes =
  "@keyframes kf-shimmer{0%{translate:-100% 0}62%,100%{translate:100% 0}}"

/* Shimmer: a soft band of light sweeps across the block. The band follows the text colour by
   default; set --kf-shimmer to change it. With reduced motion the block stays still. */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <>
      <style href="kf-skeleton" precedence="default">
        {keyframes}
      </style>
      <div
        data-slot="skeleton"
        aria-hidden
        className={cn(
          "relative isolate overflow-hidden",
          "after:absolute after:inset-0 after:bg-[linear-gradient(90deg,transparent,var(--kf-shimmer,color-mix(in_oklch,currentColor_7%,transparent))_50%,transparent)]",
          "after:-translate-x-full after:animate-[kf-shimmer_calc(1800ms*var(--kf-speed,1))_var(--ease-house)_infinite]",
          "motion-reduce:after:hidden motion-reduce:after:animate-none!",
          className,
        )}
        {...props}
      />
    </>
  )
}

/* Shows `fallback` (your skeletons) while `loading`, then crossfades to `children`: the skeletons
   fade out and each direct child of the content rises out of a light blur, one after another.
   Both layers share one grid cell, so the swap never jumps. Content that mounts only once loaded
   gets the same entrance through @starting-style. */
function SkeletonSwap({
  loading,
  fallback,
  className,
  contentClassName,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  loading: boolean
  fallback: React.ReactNode
  /** Classes for the content layer, whose direct children cascade in. */
  contentClassName?: string
}) {
  return (
    <div
      data-slot="skeleton-swap"
      data-loading={loading || undefined}
      aria-busy={loading || undefined}
      className={cn("grid", className)}
      {...props}
    >
      <div
        data-slot="skeleton-swap-fallback"
        aria-hidden
        inert={!loading}
        className={cn(
          "[grid-area:1/1] transition-[opacity,filter] duration-[calc(240ms*var(--kf-speed,1))] ease-house motion-reduce:transition-none!",
          !loading && "pointer-events-none opacity-0 blur-[2px] [&_[data-slot=skeleton]]:after:[animation-play-state:paused]",
        )}
      >
        {fallback}
      </div>
      <div
        data-slot="skeleton-swap-content"
        aria-hidden={loading || undefined}
        inert={loading}
        className={cn(
          "[grid-area:1/1]",
          "*:transition-[opacity,translate,filter] *:duration-[calc(560ms*var(--kf-speed,1))] *:ease-spring",
          "*:starting:translate-y-3 *:starting:opacity-0 *:starting:blur-[6px]",
          "*:[transition-delay:calc(calc(90ms*var(--kf-speed,1))+(min(sibling-index(),10)-1)*calc(60ms*var(--kf-speed,1)))]",
          loading &&
            "*:translate-y-3 *:opacity-0 *:blur-[6px] *:duration-[calc(160ms*var(--kf-speed,1))] *:ease-house *:[transition-delay:0ms]",
          "motion-reduce:*:transition-none",
          contentClassName,
        )}
      >
        {children}
      </div>
    </div>
  )
}

export { Skeleton, SkeletonSwap }
