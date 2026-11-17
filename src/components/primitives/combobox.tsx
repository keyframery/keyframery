"use client"

/* Animated drop-in for `@ui-sdk/react/combobox`: same parts, same props. Swap the import and keep your code.
   This file adds motion only. Colours, radii, shadows and spacing stay yours.

   - Content: Unfold from the field (scale 0.86, 6px blur, 8px toward the field, spring in, quick out).
   - Items: Cascade in one after another as the list opens.
   - List: Glide, one highlight that springs from row to row (CSS anchor positioning).
   - Clear button and chips: pop in. Trigger, clear and chip remove: Press. */

import {
  ComboboxChip as ComboboxChipPart,
  ComboboxChipRemove as ComboboxChipRemovePart,
  ComboboxClear as ComboboxClearPart,
  ComboboxContent as ComboboxContentPart,
  ComboboxCreate as ComboboxCreatePart,
  ComboboxItem as ComboboxItemPart,
  ComboboxList as ComboboxListPart,
  ComboboxSelectAll as ComboboxSelectAllPart,
  ComboboxTrigger as ComboboxTriggerPart,
} from "@ui-sdk/react/combobox"
import * as React from "react"

import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

export * from "@ui-sdk/react/combobox"

const press =
  "transition-[scale,color,background-color,opacity] duration-[calc(200ms*var(--kf-speed,1))] ease-pop active:scale-[0.9] motion-reduce:transition-none!"

/* Rows that cascade while the content they sit in has its starting style, and that anchor the
   gliding highlight while highlighted. Only opacity, translate and filter carry the delay. */
const row = cn(
  "transition-[opacity,translate,filter] duration-[calc(420ms*var(--kf-speed,1))] ease-spring [transition-delay:calc((min(sibling-index(),10)-1)*calc(32ms*var(--kf-speed,1)))]",
  "group-data-starting-style/kf-content:translate-y-2 group-data-starting-style/kf-content:opacity-0 group-data-starting-style/kf-content:blur-[4px]",
  "group-data-ending-style/kf-content:[transition-delay:0ms]",
  "group-data-starting-style/kf-content:transition-none",
  "data-highlighted:[anchor-name:--kf-hl]",
  "motion-reduce:transition-none!",
)

function ComboboxContent({ className, ...props }: React.ComponentProps<typeof ComboboxContentPart>) {
  return (
    <ComboboxContentPart
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

/* The list carries the highlight: a `::before` that follows whichever row is highlighted. Its
   neutral surface follows the text colour; give `before:bg-…` in className to change it. */
function ComboboxList({ className, ...props }: React.ComponentProps<typeof ComboboxListPart>) {
  return (
    <ComboboxListPart
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

function ComboboxItem<T = string>({ className, ...props }: React.ComponentProps<typeof ComboboxItemPart<T>>) {
  return <ComboboxItemPart<T> className={withClass(row, className)} {...props} />
}

function ComboboxCreate({ className, ...props }: React.ComponentProps<typeof ComboboxCreatePart>) {
  return <ComboboxCreatePart className={withClass(row, className)} {...props} />
}

function ComboboxSelectAll({ className, ...props }: React.ComponentProps<typeof ComboboxSelectAllPart>) {
  return <ComboboxSelectAllPart className={withClass(row, className)} {...props} />
}

function ComboboxTrigger({ className, ...props }: React.ComponentProps<typeof ComboboxTriggerPart>) {
  return (
    <ComboboxTriggerPart
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
function ComboboxClear({ className, ...props }: React.ComponentProps<typeof ComboboxClearPart>) {
  return (
    <ComboboxClearPart
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

/* A chip pops in when its value is added. */
function ComboboxChip<T = string>({ className, ...props }: React.ComponentProps<typeof ComboboxChipPart<T>>) {
  return (
    <ComboboxChipPart<T>
      className={withClass("transition-[scale,opacity] duration-[calc(380ms*var(--kf-speed,1))] ease-pop starting:scale-50 starting:opacity-0 motion-reduce:transition-none!", className)}
      {...props}
    />
  )
}

function ComboboxChipRemove({ className, ...props }: React.ComponentProps<typeof ComboboxChipRemovePart>) {
  return <ComboboxChipRemovePart className={withClass(press, className)} {...props} />
}

export {
  ComboboxChip,
  ComboboxChipRemove,
  ComboboxClear,
  ComboboxContent,
  ComboboxCreate,
  ComboboxItem,
  ComboboxList,
  ComboboxSelectAll,
  ComboboxTrigger,
}
