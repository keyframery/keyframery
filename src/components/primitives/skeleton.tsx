"use client"

/* Animated skeleton, on UI SDK's core. UI SDK ships no skeleton, so the behaviour is defined in
   `@/components/core/skeleton` with `definePrimitive` and rendered here with shadcn's part name
   (Skeleton) plus SkeletonSwap. This file adds motion only. Colours, radii and sizes stay yours.

   - Shimmer: a soft band of light sweeps across each block, then rests a moment (`data-shimmer`).
   - Swap: when `loading` ends, the placeholders fade out and each direct child of the content rises
     out of a light blur, one after another. Both layers share one grid cell, so nothing jumps. */

import { createParts } from "@ui-sdk/react/primitive"
import type { StateOf } from "@ui-sdk/core"
import * as React from "react"

import { skeleton, skeletonSwap } from "@/components/core/skeleton"
import { cn } from "@/lib/utils"

/* The sweep crosses, then rests a moment before the next one. */
const keyframes = "@keyframes kf-shimmer{0%{translate:-100% 0}62%,100%{translate:100% 0}}"

/* A class name that may be a function of the part's state, merged after ours. */
function withClass<S>(ours: string, theirs: string | ((state: S) => string | undefined) | undefined) {
  return typeof theirs === "function" ? (state: S) => cn(ours, theirs(state)) : cn(ours, theirs)
}

const { Root: SkeletonRoot } = createParts(skeleton, { root: "div" })
const swap = createParts(skeletonSwap, { root: "div", fallback: "div", content: "div" })

/* Shimmer: the band follows the text colour by default; set --kf-shimmer to change it. With reduced
   motion the block stays still. */
function Skeleton({ className, ...props }: React.ComponentProps<typeof SkeletonRoot>) {
  return (
    <>
      <style href="kf-skeleton" precedence="default">
        {keyframes}
      </style>
      <SkeletonRoot
        className={withClass<StateOf<typeof skeleton, "root">>(
          cn(
            "relative isolate overflow-hidden",
            "data-shimmer:after:absolute data-shimmer:after:inset-0 data-shimmer:after:bg-[linear-gradient(90deg,transparent,var(--kf-shimmer,color-mix(in_oklch,currentColor_7%,transparent))_50%,transparent)]",
            "data-shimmer:after:-translate-x-full data-shimmer:after:animate-[kf-shimmer_calc(1800ms*var(--kf-speed,1))_var(--ease-house)_infinite]",
            "motion-reduce:after:hidden motion-reduce:after:animate-none!",
          ),
          className,
        )}
        {...props}
      />
    </>
  )
}

type SwapState = StateOf<typeof skeletonSwap, "root">

/* Shows `fallback` (your skeletons) while `loading`, then crossfades to `children`. Content that
   mounts only once loaded gets the same entrance through @starting-style. */
function SkeletonSwap({
  loading,
  fallback,
  className,
  contentClassName,
  children,
  ...props
}: Omit<React.ComponentProps<typeof swap.Root>, "loading" | "children"> & {
  loading: boolean
  fallback: React.ReactNode
  /** Classes for the content layer, whose direct children cascade in. */
  contentClassName?: string
  children?: React.ReactNode
}) {
  return (
    <swap.Root loading={loading} className={withClass<SwapState>("grid", className)} {...props}>
      <swap.Fallback
        className={cn(
          "[grid-area:1/1] transition-[opacity,filter] duration-[calc(240ms*var(--kf-speed,1))] ease-house motion-reduce:transition-none!",
          "not-data-loading:pointer-events-none not-data-loading:opacity-0 not-data-loading:blur-[2px] not-data-loading:[&_[data-slot=skeleton]]:after:[animation-play-state:paused]",
        )}
      >
        {fallback}
      </swap.Fallback>
      <swap.Content
        className={cn(
          "[grid-area:1/1]",
          "*:transition-[opacity,translate,filter] *:duration-[calc(560ms*var(--kf-speed,1))] *:ease-spring",
          "*:starting:translate-y-3 *:starting:opacity-0 *:starting:blur-[6px]",
          "*:[transition-delay:calc(calc(90ms*var(--kf-speed,1))+(min(sibling-index(),10)-1)*calc(60ms*var(--kf-speed,1)))]",
          "data-loading:*:translate-y-3 data-loading:*:opacity-0 data-loading:*:blur-[6px] data-loading:*:duration-[calc(160ms*var(--kf-speed,1))] data-loading:*:ease-house data-loading:*:[transition-delay:0ms]",
          "motion-reduce:*:transition-none",
          contentClassName,
        )}
      >
        {children}
      </swap.Content>
    </swap.Root>
  )
}

export { Skeleton, SkeletonSwap }
