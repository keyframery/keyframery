"use client"

/* Animated drop-in for `@ui-sdk/react/autocomplete`: same parts, same props. Swap the import and keep your code.
   This file adds motion only. Colours, radii, shadows and spacing stay yours.

   - Content: Unfold from the field (scale 0.86, 6px blur, 8px toward the field, spring in, quick out).
   - Items: Cascade in one after another as the suggestions open.
   - List: Glide, one highlight that springs from row to row (CSS anchor positioning).
   - Clear button: pops in. Trigger and clear: Press. */

import {
  AutocompleteClear as AutocompleteClearPart,
  AutocompleteContent as AutocompleteContentPart,
  AutocompleteItem as AutocompleteItemPart,
  AutocompleteList as AutocompleteListPart,
  AutocompleteTrigger as AutocompleteTriggerPart,
} from "@ui-sdk/react/autocomplete"
import * as React from "react"

import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

export * from "@ui-sdk/react/autocomplete"

const press =
  "transition-[scale,color,background-color,opacity] duration-[calc(200ms*var(--kf-speed,1))] ease-pop active:scale-[0.9] motion-reduce:transition-none!"

function AutocompleteContent({ className, ...props }: React.ComponentProps<typeof AutocompleteContentPart>) {
  return (
    <AutocompleteContentPart
      className={withClass(
        cn(
          "group/kf-content origin-(--transform-origin) transition-[opacity,scale,translate,filter] duration-[calc(380ms*var(--kf-speed,1))] ease-spring",
          "data-starting-style:scale-[0.86] data-starting-style:opacity-0 data-starting-style:blur-[6px]",
          "data-[side=bottom]:data-starting-style:-translate-y-2 data-[side=top]:data-starting-style:translate-y-2",
          "data-[side=left]:data-starting-style:translate-x-2 data-[side=right]:data-starting-style:-translate-x-2",
          "data-ending-style:scale-[0.96] data-ending-style:opacity-0 data-ending-style:blur-[2px] data-ending-style:duration-[calc(150ms*var(--kf-speed,1))] data-ending-style:ease-house",
          "motion-reduce:transition-none!",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* The list carries the highlight: a `::before` that follows whichever suggestion is highlighted.
   Its neutral surface follows the text colour; give `before:bg-…` in className to change it. */
function AutocompleteList({ className, ...props }: React.ComponentProps<typeof AutocompleteListPart>) {
  return (
    <AutocompleteListPart
      className={withClass(
        cn(
          "relative isolate [anchor-scope:--kf-hl]",
          "before:pointer-events-none before:absolute before:-z-10 before:bg-[color-mix(in_oklch,currentColor_9%,transparent)] before:opacity-0",
          "before:[position-anchor:--kf-hl] before:top-[anchor(top)] before:right-[anchor(right)] before:bottom-[anchor(bottom)] before:left-[anchor(left)]",
          "before:transition-[top,right,bottom,left,opacity] before:duration-[calc(260ms*var(--kf-speed,1))] before:ease-spring",
          "has-[[data-highlighted]]:before:opacity-100",
          "motion-reduce:before:transition-none!",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* Suggestions cascade while the content has its starting style, and anchor the highlight.
   Only opacity, translate and filter carry the delay, so hovering is never slowed. */
function AutocompleteItem({ className, ...props }: React.ComponentProps<typeof AutocompleteItemPart>) {
  return (
    <AutocompleteItemPart
      className={withClass(
        cn(
          "transition-[opacity,translate,filter] duration-[calc(420ms*var(--kf-speed,1))] ease-spring [transition-delay:calc((min(sibling-index(),10)-1)*calc(32ms*var(--kf-speed,1)))]",
          "group-data-starting-style/kf-content:translate-y-2 group-data-starting-style/kf-content:opacity-0 group-data-starting-style/kf-content:blur-[4px]",
          "group-data-ending-style/kf-content:[transition-delay:0ms]",
          "group-data-starting-style/kf-content:transition-none",
          "data-highlighted:[anchor-name:--kf-hl]",
          "motion-reduce:transition-none!",
        ),
        className,
      )}
      {...props}
    />
  )
}

function AutocompleteTrigger({ className, ...props }: React.ComponentProps<typeof AutocompleteTriggerPart>) {
  return (
    <AutocompleteTriggerPart
      className={withClass(
        cn(
          press,
          "[&_svg]:transition-[rotate] [&_svg]:duration-[calc(420ms*var(--kf-speed,1))] [&_svg]:ease-spring data-open:[&_svg]:rotate-180 motion-reduce:[&_svg]:transition-none",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* Only in the page while there is text, so it pops in from its starting style. */
function AutocompleteClear({ className, ...props }: React.ComponentProps<typeof AutocompleteClearPart>) {
  return (
    <AutocompleteClearPart
      className={withClass(
        cn(
          press, "duration-[calc(360ms*var(--kf-speed,1))] starting:scale-50 starting:opacity-0",
        ),
        className,
      )}
      {...props}
    />
  )
}

export { AutocompleteClear, AutocompleteContent, AutocompleteItem, AutocompleteList, AutocompleteTrigger }
