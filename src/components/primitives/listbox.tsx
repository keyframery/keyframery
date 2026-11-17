"use client"

/* Animated drop-in for `@ui-sdk/react/listbox`: same parts, same props. Swap the import and keep your code.
   This file adds motion only. Colours, radii, shadows and spacing stay yours.

   - Glide: one highlight springs from row to row (CSS anchor positioning): to the row under the
     pointer, or to the focused row while the list has focus. Its neutral surface follows the text
     colour; give `before:bg-…` and `before:rounded-…` to restyle it.
   - Draw: a chosen row's check draws itself, and its indicator pops in (`ease-pop`, 0.6 to 1). */

import {
  Listbox as ListboxPart,
  ListboxItem as ListboxItemPart,
  ListboxItemIndicator as ListboxItemIndicatorPart,
  type ListboxProps,
} from "@ui-sdk/react/listbox"
import * as React from "react"

import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

export * from "@ui-sdk/react/listbox"

const keyframes = "@keyframes kf-pop-in{from{scale:0.6}}"

function Listbox<T = string, Multiple extends boolean | undefined = false>({
  className,
  ...props
}: ListboxProps<T, Multiple>) {
  /* Hold the pop until after the first paint, so chosen rows don't pop on load. */
  const [ready, setReady] = React.useState(false)
  React.useEffect(() => {
    const timer = setTimeout(() => setReady(true), 150)
    return () => clearTimeout(timer)
  }, [])
  return (
    <>
      <style href="kf-listbox-pop" precedence="default">
        {keyframes}
      </style>
      <ListboxPart<T, Multiple>
        {...({
          ...props,
          "data-kf-ready": ready || undefined,
          className: withClass(
            cn(
              "group/kf-lb relative isolate [anchor-scope:--kf-hl]",
              "before:pointer-events-none before:absolute before:-z-10 before:hidden before:bg-[color-mix(in_oklch,currentColor_9%,transparent)]",
              "before:[position-anchor:--kf-hl] before:top-[anchor(top)] before:right-[anchor(right)] before:bottom-[anchor(bottom)] before:left-[anchor(left)]",
              "before:[transition:top_calc(260ms*var(--kf-speed,1))_var(--ease-spring),right_calc(260ms*var(--kf-speed,1))_var(--ease-spring),bottom_calc(260ms*var(--kf-speed,1))_var(--ease-spring),left_calc(260ms*var(--kf-speed,1))_var(--ease-spring),opacity_calc(150ms*var(--kf-speed,1))_var(--ease-house)]",
              "has-[[data-slot=listbox-item]:hover]:before:block focus-within:has-[[data-highlighted]]:before:block starting:before:opacity-0",
              "motion-reduce:before:[transition:none]!",
            ),
            className,
          ),
        } as ListboxProps<T, Multiple>)}
      />
    </>
  )
}

/* The highlight follows the pointer; without one, the focused row. */
function ListboxItem<T = string>({ className, ...props }: React.ComponentProps<typeof ListboxItemPart<T>>) {
  return (
    <ListboxItemPart<T>
      className={withClass(
        cn(
          "hover:[anchor-name:--kf-hl] data-highlighted:[anchor-name:--kf-hl]",
          "group-has-[[data-slot=listbox-item]:hover]/kf-lb:data-highlighted:not-hover:[anchor-name:none]",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* Draw: the check's stroke draws in as its row is chosen, and the indicator pops.
   Works with any check path up to 24 units long. */
function ListboxItemIndicator({ className, ...props }: React.ComponentProps<typeof ListboxItemIndicatorPart>) {
  return (
    <ListboxItemIndicatorPart
      className={withClass(
        cn(
          "[&_:is(path,polyline)]:[stroke-dasharray:24] [&_:is(path,polyline)]:[stroke-dashoffset:24]",
          "[&_:is(path,polyline)]:transition-[stroke-dashoffset] [&_:is(path,polyline)]:duration-[calc(260ms*var(--kf-speed,1))] [&_:is(path,polyline)]:ease-house",
          "data-selected:[&_:is(path,polyline)]:[stroke-dashoffset:0] data-selected:[&_:is(path,polyline)]:delay-[calc(75ms*var(--kf-speed,1))]",
          "data-selected:[&_:is(path,polyline)]:starting:[stroke-dashoffset:24]",
          "motion-reduce:animate-none! group-data-kf-ready/kf-lb:data-selected:[animation:kf-pop-in_calc(380ms*var(--kf-speed,1))_var(--ease-pop)]",
          "motion-reduce:[&_:is(path,polyline)]:transition-none motion-reduce:animate-none!",
        ),
        className,
      )}
      {...props}
    />
  )
}

export { Listbox, ListboxItem, ListboxItemIndicator }
