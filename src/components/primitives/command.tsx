"use client"

/* Animated drop-in for `@ui-sdk/react/command`: same parts, same props. Swap the import and keep your code.
   This file adds motion only. Colours, radii, shadows and spacing stay yours.

   - List: Glide, one highlight that springs from command to command (CSS anchor positioning).
   - Items: arrive one after another (Cascade), 24px from the side with a 6px blur, whenever they
     come into the page: when the palette mounts, when a page opens, and when a search lets them back. */

import {
  CommandGroupLabel as CommandGroupLabelPart,
  CommandItem as CommandItemPart,
  CommandList as CommandListPart,
} from "@ui-sdk/react/command"
import * as React from "react"

import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

export * from "@ui-sdk/react/command"

/* Only opacity, translate and filter transition here, so the delay never slows a hover. */
const arrive = cn(
  "transition-[opacity,translate,filter] duration-[calc(460ms*var(--kf-speed,1))] ease-spring [transition-delay:calc((min(sibling-index(),10)-1)*calc(32ms*var(--kf-speed,1)))]",
  "starting:translate-x-6 starting:opacity-0 starting:blur-[6px]",
  "motion-reduce:transition-none!",
)

/* The list carries the highlight: a `::before` that follows the highlighted command. Its neutral
   surface follows the text colour; give `before:bg-…` in className to change it. */
function CommandList({ className, ...props }: React.ComponentProps<typeof CommandListPart>) {
  return (
    <CommandListPart
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

function CommandItem({ className, ...props }: React.ComponentProps<typeof CommandItemPart>) {
  return (
    <CommandItemPart className={withClass(
      cn(
        arrive, "data-highlighted:[anchor-name:--kf-hl]",
      ),
      className,
    )} {...props} />
  )
}

function CommandGroupLabel({ className, ...props }: React.ComponentProps<typeof CommandGroupLabelPart>) {
  return <CommandGroupLabelPart className={withClass(arrive, className)} {...props} />
}

export { CommandGroupLabel, CommandItem, CommandList }
