"use client"

/* Animated drop-in for `@ui-sdk/react/collapsible`: same parts, same props. Swap the import and keep your code.
   This file adds motion only. Colours, radii, shadows and spacing stay yours. */

import { CollapsiblePanel as CollapsiblePanelPart } from "@ui-sdk/react/collapsible"
import * as React from "react"

import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

export * from "@ui-sdk/react/collapsible"

/* Height: the panel grows to its measured height over 380ms. Cascade: each direct child
   rises 8px out of a 4px blur, 32ms after the one before, so the content arrives as the space
   opens (the children jump to their start while the panel has data-starting-style, otherwise
   their own delay would hold them visible through that first frame). On close everything
   leaves together, quickly. Only opacity, translate and filter
   transition on the children, so the stagger never slows their own hover states. */
function CollapsiblePanel({ className, ...props }: React.ComponentProps<typeof CollapsiblePanelPart>) {
  return (
    <CollapsiblePanelPart
      className={withClass(
        cn(
          "h-(--collapsible-panel-height) overflow-hidden",
          "transition-[height] duration-[calc(380ms*var(--kf-speed,1))] ease-house",
          "data-starting-style:h-0 data-ending-style:h-0 data-ending-style:duration-[calc(260ms*var(--kf-speed,1))]",
          "*:transition-[opacity,translate,filter] *:duration-[calc(420ms*var(--kf-speed,1))] *:ease-spring",
          "*:[transition-delay:calc((min(sibling-index(),10)-1)*calc(32ms*var(--kf-speed,1))+calc(40ms*var(--kf-speed,1)))]",
          "data-starting-style:*:translate-y-2 data-starting-style:*:opacity-0 data-starting-style:*:blur-[4px] data-starting-style:*:transition-none",
          "data-ending-style:*:opacity-0 data-ending-style:*:blur-[4px] data-ending-style:*:duration-[calc(150ms*var(--kf-speed,1))] data-ending-style:*:ease-house data-ending-style:*:[transition-delay:0ms]",
          "motion-reduce:transition-none! motion-reduce:*:transition-none",
        ),
        className,
      )}
      {...props}
    />
  )
}

export { CollapsiblePanel }
