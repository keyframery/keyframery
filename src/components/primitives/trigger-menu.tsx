"use client"

/* Animated drop-in for `@ui-sdk/react/trigger-menu`: same parts, same props. Swap the import and keep your code.
   This file adds motion only. Colours, radii, shadows and spacing stay yours.

   - Content: Unfold from the caret (scale 0.86, 6px blur, 8px toward the line; spring in, quick out).
   - List: rows Cascade in as the list opens, and one highlight Glides between them as you
     arrow through (CSS anchor positioning). Its neutral surface follows the text colour; give
     `before:bg-…` and `before:rounded-…` to restyle it. */

import {
  TriggerMenuContent as TriggerMenuContentPart,
  TriggerMenuItem as TriggerMenuItemPart,
  TriggerMenuList as TriggerMenuListPart,
} from "@ui-sdk/react/trigger-menu"
import * as React from "react"

import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

export * from "@ui-sdk/react/trigger-menu"

function TriggerMenuContent({ className, ...props }: React.ComponentProps<typeof TriggerMenuContentPart>) {
  return (
    <TriggerMenuContentPart
      className={withClass(
        cn(
          "group/kf-tm origin-(--transform-origin)",
          "[transition:opacity_calc(380ms*var(--kf-speed,1))_var(--ease-spring),scale_calc(380ms*var(--kf-speed,1))_var(--ease-spring),translate_calc(380ms*var(--kf-speed,1))_var(--ease-spring),filter_calc(380ms*var(--kf-speed,1))_var(--ease-spring)]",
          "data-[side=bottom]:[--kf-from:0_-8px] data-[side=top]:[--kf-from:0_8px] data-[side=left]:[--kf-from:8px_0] data-[side=right]:[--kf-from:-8px_0]",
          "data-starting-style:[translate:var(--kf-from,0_0)] data-starting-style:scale-[0.86] data-starting-style:opacity-0 data-starting-style:blur-[6px]",
          "data-ending-style:scale-[0.96] data-ending-style:opacity-0 data-ending-style:blur-[2px]",
          "data-ending-style:[transition:opacity_calc(150ms*var(--kf-speed,1))_var(--ease-house),scale_calc(150ms*var(--kf-speed,1))_var(--ease-house),translate_calc(150ms*var(--kf-speed,1))_var(--ease-house),filter_calc(150ms*var(--kf-speed,1))_var(--ease-house)]",
          "motion-reduce:[transition:none]!",
        ),
        className,
      )}
      {...props}
    />
  )
}

function TriggerMenuList({ className, ...props }: React.ComponentProps<typeof TriggerMenuListPart>) {
  return (
    <TriggerMenuListPart
      className={withClass(
        cn(
          /* Cascade: the list's children, one after another, while the content unfolds. */
          "[&>*]:transition-[opacity,translate,filter] [&>*]:duration-[calc(420ms*var(--kf-speed,1))] [&>*]:ease-spring",
          "[&>*]:[transition-delay:calc((min(sibling-index(),10)-1)*calc(32ms*var(--kf-speed,1)))]",
          "group-data-starting-style/kf-tm:[&>*]:translate-y-2 group-data-starting-style/kf-tm:[&>*]:opacity-0 group-data-starting-style/kf-tm:[&>*]:blur-[4px]",
          "group-data-ending-style/kf-tm:[&>*]:[transition-delay:0ms]",
          "group-data-starting-style/kf-tm:[&>*]:[transition:none]",
          /* Glide */
          "relative isolate [anchor-scope:--kf-hl]",
          "before:pointer-events-none before:absolute before:-z-10 before:hidden before:bg-[color-mix(in_oklch,currentColor_9%,transparent)]",
          "before:[position-anchor:--kf-hl] before:top-[anchor(top)] before:right-[anchor(right)] before:bottom-[anchor(bottom)] before:left-[anchor(left)]",
          "before:[transition:top_calc(260ms*var(--kf-speed,1))_var(--ease-spring),right_calc(260ms*var(--kf-speed,1))_var(--ease-spring),bottom_calc(260ms*var(--kf-speed,1))_var(--ease-spring),left_calc(260ms*var(--kf-speed,1))_var(--ease-spring),opacity_calc(150ms*var(--kf-speed,1))_var(--ease-house)]",
          "has-[[data-highlighted]]:before:block starting:before:opacity-0",
          "motion-reduce:[&>*]:[transition:none] motion-reduce:before:[transition:none]!",
        ),
        className,
      )}
      {...props}
    />
  )
}

function TriggerMenuItem<T = string>({ className, ...props }: React.ComponentProps<typeof TriggerMenuItemPart<T>>) {
  return <TriggerMenuItemPart<T> className={withClass("data-highlighted:[anchor-name:--kf-hl]", className)} {...props} />
}

export { TriggerMenuContent, TriggerMenuItem, TriggerMenuList }
