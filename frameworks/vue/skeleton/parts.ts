/* UI SDK parts for skeleton, made once from the shared core definition (the same file React uses). */
import { createParts } from "@ui-sdk/vue/primitive"

import { skeleton, skeletonSwap } from "@/components/keyframery/core/skeleton-core"
import { cn } from "@/lib/utils"

/* The sweep crosses, then rests a moment before the next one. */
const keyframes = "@keyframes kf-shimmer{0%{translate:-100% 0}62%,100%{translate:100% 0}}"
if (typeof document !== "undefined" && !document.getElementById("kf-skeleton")) {
  const s = document.createElement("style")
  s.id = "kf-skeleton"
  s.textContent = keyframes
  document.head.append(s)
}

export const { Root: SkeletonRoot } = createParts(skeleton, { root: "div" })
export const {
  Root: SkeletonSwapRoot,
  Fallback: SkeletonSwapFallback,
  Content: SkeletonSwapContent,
} = createParts(skeletonSwap, { root: "div", fallback: "div", content: "div" })

/* Shimmer: the band follows the text colour by default; set --kf-shimmer to change it. With reduced
   motion the block stays still. */
export const skeletonMotion = cn(
  "relative isolate overflow-hidden",
  "data-shimmer:after:absolute data-shimmer:after:inset-0 data-shimmer:after:bg-[linear-gradient(90deg,transparent,var(--kf-shimmer,color-mix(in_oklch,currentColor_7%,transparent))_50%,transparent)]",
  "data-shimmer:after:-translate-x-full data-shimmer:after:animate-[kf-shimmer_calc(1800ms*var(--kf-speed,1))_var(--ease-house)_infinite]",
  "motion-reduce:after:hidden motion-reduce:after:animate-none!",
)

/* The Keyframery look. Theming: --skeleton-face, --skeleton-sweep, --skeleton-radius. */
export const skeletonLook = cn(
  "rounded-[var(--skeleton-radius,8px)] bg-[var(--skeleton-face,color-mix(in_oklab,var(--foreground)_7%,transparent))] dark:bg-[var(--skeleton-face,color-mix(in_oklab,var(--foreground)_8%,transparent))]",
  "[--kf-shimmer:var(--skeleton-sweep,color-mix(in_oklch,var(--background)_80%,transparent))] dark:[--kf-shimmer:var(--skeleton-sweep,color-mix(in_oklch,var(--foreground)_10%,transparent))]",
)

export const swapFallback = cn(
  "[grid-area:1/1] transition-[opacity,filter] duration-[calc(240ms*var(--kf-speed,1))] ease-house motion-reduce:transition-none!",
  "not-data-loading:pointer-events-none not-data-loading:opacity-0 not-data-loading:blur-[calc(2px*var(--kf-flourish,1))] not-data-loading:[&_[data-slot=skeleton]]:after:[animation-play-state:paused]",
)

export const swapContent = cn(
  "[grid-area:1/1]",
  "*:transition-[opacity,translate,filter] *:duration-[calc(560ms*var(--kf-speed,1))] *:ease-spring",
  "*:starting:translate-y-[calc(0.75rem*var(--kf-flourish,1))] *:starting:opacity-0 *:starting:blur-[calc(6px*var(--kf-flourish,1))]",
  "*:[transition-delay:calc(calc(90ms*var(--kf-speed,1))+(min(sibling-index(),10)-1)*calc(60ms*var(--kf-speed,1))*var(--kf-flourish,1))]",
  "data-loading:*:translate-y-[calc(0.75rem*var(--kf-flourish,1))] data-loading:*:opacity-0 data-loading:*:blur-[calc(6px*var(--kf-flourish,1))] data-loading:*:duration-[calc(160ms*var(--kf-speed,1))] data-loading:*:ease-house data-loading:*:[transition-delay:0ms]",
  "motion-reduce:*:transition-none",
)
