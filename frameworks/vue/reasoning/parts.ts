/* UI SDK parts for reasoning, made once from the shared core definition (the same file React uses).
   Opening and closing is UI SDK's collapsible. */
import type { ComputedRef, InjectionKey } from "vue"
import { createParts } from "@ui-sdk/vue/primitive"

import { reasoning } from "@/components/keyframery/core/reasoning-core"
import { cn } from "@/lib/utils"

export const parts = createParts(reasoning, { root: "div", label: "span" })

const keyframes = "@keyframes kf-reasoning-shimmer{from{background-position:100% 0}to{background-position:0% 0}}"
if (typeof document !== "undefined" && !document.getElementById("kf-reasoning")) {
  const style = document.createElement("style")
  style.id = "kf-reasoning"
  style.textContent = keyframes
  document.head.append(style)
}

/** Whether the reasoning around is streaming, for its content (React's ReasoningContext). */
export const ReasoningContext: InjectionKey<ComputedRef<{ streaming: boolean }>> = Symbol("kf-reasoning")

export const rootClass = "flex w-full min-w-0 flex-col"

/* Shimmer: while it thinks, a light passes through "Thinking…". */
export const labelClass = cn(
  "data-streaming:bg-[linear-gradient(90deg,currentColor_0%,currentColor_38%,color-mix(in_oklch,currentColor_25%,transparent)_50%,currentColor_62%,currentColor_100%)]",
  "data-streaming:bg-[length:250%_100%] data-streaming:bg-clip-text data-streaming:[-webkit-text-fill-color:transparent]",
  "data-streaming:animate-[kf-reasoning-shimmer_calc(1800ms*var(--kf-speed,1))_var(--ease-house)_infinite]",
  "motion-reduce:animate-none! motion-reduce:bg-none! motion-reduce:[-webkit-text-fill-color:currentColor]!",
)

export const triggerClass = cn(
  "group/reasoning-trigger transition-[scale] duration-[calc(220ms*var(--kf-speed,1))] ease-pop active:scale-[calc(1-0.02*var(--kf-flourish,1))] motion-reduce:transition-none!",
  cn(
    "-mx-1.5 flex h-7 w-fit max-w-full min-w-0 cursor-pointer items-center gap-1 rounded-[7px] px-1.5 text-start text-[13px] leading-none font-medium outline-none select-none",
    "text-[color:var(--reasoning-ink,var(--muted-foreground))] transition-[color,background-color] duration-[calc(150ms*var(--kf-speed,1))] ease-house motion-reduce:transition-none",
    "hover:text-foreground data-open:text-foreground in-data-streaming:text-foreground",
    "*:data-[slot=reasoning-chevron]:text-muted-foreground/70",
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "*:data-[slot=reasoning-label]:truncate *:data-[slot=reasoning-label]:py-px",
  ),
)

export const chevronClass =
  "inline-grid shrink-0 place-items-center transition-[rotate] duration-[calc(460ms*var(--kf-speed,1))] ease-spring group-data-open/reasoning-trigger:rotate-90 rtl:-scale-x-100 motion-reduce:transition-none!"

/* Height and Cascade, from Keyframery's collapsible panel, then the look: the thinking hangs off a
   hairline in smaller muted text and scrolls once it gets long. */
export const contentClass = cn(
  cn(
    "h-(--collapsible-panel-height) overflow-hidden",
    "transition-[height] duration-[calc(380ms*var(--kf-speed,1))] ease-house",
    "data-starting-style:h-0 data-ending-style:h-0 data-ending-style:duration-[calc(260ms*var(--kf-speed,1))]",
    "*:transition-[opacity,translate,filter] *:duration-[calc(420ms*var(--kf-speed,1))] *:ease-spring",
    "*:[transition-delay:calc((min(sibling-index(),10)-1)*calc(32ms*var(--kf-speed,1)*var(--kf-flourish,1))+calc(40ms*var(--kf-speed,1)*var(--kf-flourish,1)))]",
    "data-starting-style:*:translate-y-[calc(0.5rem*var(--kf-flourish,1))] data-starting-style:*:opacity-0 data-starting-style:*:blur-[calc(4px*var(--kf-flourish,1))] data-starting-style:*:transition-none",
    "data-ending-style:*:opacity-0 data-ending-style:*:blur-[calc(4px*var(--kf-flourish,1))] data-ending-style:*:duration-[calc(150ms*var(--kf-speed,1))] data-ending-style:*:ease-house data-ending-style:*:[transition-delay:0ms]",
    "motion-reduce:transition-none! motion-reduce:*:transition-none",
  ),
  cn(
    "ms-[3px] min-w-0 border-s border-[color:var(--reasoning-rule,var(--border))]",
    "*:data-[slot=reasoning-scroll]:mt-2 *:data-[slot=reasoning-scroll]:mb-1 *:data-[slot=reasoning-scroll]:max-h-[var(--reasoning-max-height,18rem)] *:data-[slot=reasoning-scroll]:overflow-y-auto *:data-[slot=reasoning-scroll]:overscroll-contain *:data-[slot=reasoning-scroll]:[scrollbar-width:thin]",
    "*:data-[slot=reasoning-scroll]:ps-[var(--reasoning-indent,0.875rem)] *:data-[slot=reasoning-scroll]:text-[length:var(--reasoning-font,13px)] *:data-[slot=reasoning-scroll]:leading-relaxed",
    "*:data-[slot=reasoning-scroll]:text-[color:var(--reasoning-text,var(--muted-foreground))]",
  ),
)

export const markdownClass =
  "[--markdown-font:var(--reasoning-font,13px)] [--markdown-gap:0.5rem] [--markdown-ink:var(--reasoning-text,var(--muted-foreground))] [&_[data-slot=markdown-heading]]:text-[1em]! [&_[data-slot=markdown-strong]]:font-medium [&_[data-slot=markdown-strong]]:text-foreground/80"
