"use client"

/* Animated drop-in for `@ui-sdk/react/select`: same parts, same props. Swap the import and keep your code.
   This file adds motion only. Colours, radii, shadows and spacing stay yours.

   - Content: Unfold from the field (scale 0.86, 6px blur, 8px toward it; spring in, quick out).
   - Rows: Cascade in as the list opens. Glide: one highlight springs from row to row (CSS anchor
     positioning). Its neutral surface follows the text colour; give `before:bg-…` and
     `before:rounded-…` to restyle it.
   - Checks: Draw themselves. Trigger: Press.
   - Value: a newly chosen value rises into the field (Direction, up). */

import {
  SelectContent as SelectContentPart,
  SelectItem as SelectItemPart,
  SelectItemIndicator as SelectItemIndicatorPart,
  SelectSelectAll as SelectSelectAllPart,
  SelectTrigger as SelectTriggerPart,
  SelectValue as SelectValuePart,
} from "@ui-sdk/react/select"
import * as React from "react"

import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

export * from "@ui-sdk/react/select"

const keyframes = "@keyframes kf-value-up{from{translate:0 0.75em;opacity:0;filter:blur(3px)}}"

function SelectTrigger({ className, ...props }: React.ComponentProps<typeof SelectTriggerPart>) {
  return (
    <SelectTriggerPart
      className={withClass("transition-[scale] duration-[calc(200ms*var(--kf-speed,1))] ease-pop active:scale-[0.98] motion-reduce:transition-none!", className)}
      {...props}
    />
  )
}

/* The value text is wrapped in a span keyed by its label, so a new value mounts fresh and rises in.
   A readiness gate keeps the first value still on load. Pass `render` to take over. */
function SelectValue({ className, render, ...props }: React.ComponentProps<typeof SelectValuePart>) {
  const [ready, setReady] = React.useState(false)
  React.useEffect(() => {
    const timer = setTimeout(() => setReady(true), 150)
    return () => clearTimeout(timer)
  }, [])
  return (
    <>
      <style href="kf-select-value" precedence="default">
        {keyframes}
      </style>
      <SelectValuePart
        className={withClass("overflow-hidden", className)}
        render={
          render ??
          ((partProps, state) => (
            <span {...partProps}>
              <span
                key={state.placeholder ? "\u0000placeholder" : state.label}
                className={cn(
                  "block truncate",
                  ready && "[animation:kf-value-up_calc(460ms*var(--kf-speed,1))_var(--ease-spring)] motion-reduce:animate-none!",
                )}
              >
                {partProps.children}
              </span>
            </span>
          ))
        }
        {...props}
      />
    </>
  )
}

/* Unfold + Cascade + Glide. Rows cascade whether they sit in the content or in a SelectList. */
function SelectContent({ className, ...props }: React.ComponentProps<typeof SelectContentPart>) {
  return (
    <SelectContentPart
      className={withClass(
        cn(
          "group/kf-select origin-(--transform-origin)",
          "[transition:opacity_calc(380ms*var(--kf-speed,1))_var(--ease-spring),scale_calc(380ms*var(--kf-speed,1))_var(--ease-spring),translate_calc(380ms*var(--kf-speed,1))_var(--ease-spring),filter_calc(380ms*var(--kf-speed,1))_var(--ease-spring)]",
          "data-[side=bottom]:[--kf-from:0_-8px] data-[side=top]:[--kf-from:0_8px] data-[side=left]:[--kf-from:8px_0] data-[side=right]:[--kf-from:-8px_0]",
          "data-starting-style:[translate:var(--kf-from,0_0)] data-starting-style:scale-[0.86] data-starting-style:opacity-0 data-starting-style:blur-[6px]",
          "data-ending-style:scale-[0.96] data-ending-style:opacity-0 data-ending-style:blur-[2px]",
          "data-ending-style:[transition:opacity_calc(150ms*var(--kf-speed,1))_var(--ease-house),scale_calc(150ms*var(--kf-speed,1))_var(--ease-house),translate_calc(150ms*var(--kf-speed,1))_var(--ease-house),filter_calc(150ms*var(--kf-speed,1))_var(--ease-house)]",
          /* Cascade */
          "[&>*:not([data-slot=select-list])]:transition-[opacity,translate,filter] [&>*:not([data-slot=select-list])]:duration-[calc(420ms*var(--kf-speed,1))] [&>*:not([data-slot=select-list])]:ease-spring",
          "[&>*:not([data-slot=select-list])]:[transition-delay:calc((min(sibling-index(),10)-1)*calc(32ms*var(--kf-speed,1)))]",
          "data-starting-style:[&>*:not([data-slot=select-list])]:translate-y-2 data-starting-style:[&>*:not([data-slot=select-list])]:opacity-0 data-starting-style:[&>*:not([data-slot=select-list])]:blur-[4px]",
          "[&>[data-slot=select-list]>*]:transition-[opacity,translate,filter] [&>[data-slot=select-list]>*]:duration-[calc(420ms*var(--kf-speed,1))] [&>[data-slot=select-list]>*]:ease-spring",
          "[&>[data-slot=select-list]>*]:[transition-delay:calc((min(sibling-index(),10)-1)*calc(32ms*var(--kf-speed,1)))]",
          "data-starting-style:[&>[data-slot=select-list]>*]:translate-y-2 data-starting-style:[&>[data-slot=select-list]>*]:opacity-0 data-starting-style:[&>[data-slot=select-list]>*]:blur-[4px]",
          "data-ending-style:[&>*]:[transition-delay:0ms] data-ending-style:[&>[data-slot=select-list]>*]:[transition-delay:0ms]",
          "motion-reduce:[&>*:not([data-slot=select-list])]:[translate:none]! motion-reduce:[&>*:not([data-slot=select-list])]:[filter:none]! data-starting-style:[&>*:not([data-slot=select-list])]:[transition:none] data-starting-style:[&>[data-slot=select-list]>*]:[transition:none]",
          /* Glide */
          "relative isolate [anchor-scope:--kf-hl]",
          "before:pointer-events-none before:absolute before:-z-10 before:hidden before:bg-[color-mix(in_oklch,currentColor_9%,transparent)]",
          "before:[position-anchor:--kf-hl] before:top-[anchor(top)] before:right-[anchor(right)] before:bottom-[anchor(bottom)] before:left-[anchor(left)]",
          "before:[transition:top_calc(260ms*var(--kf-speed,1))_var(--ease-spring),right_calc(260ms*var(--kf-speed,1))_var(--ease-spring),bottom_calc(260ms*var(--kf-speed,1))_var(--ease-spring),left_calc(260ms*var(--kf-speed,1))_var(--ease-spring),opacity_calc(150ms*var(--kf-speed,1))_var(--ease-house)]",
          "has-[[data-highlighted]]:before:block starting:before:opacity-0",
          "motion-reduce:[transition:none]! motion-reduce:before:[transition:none]! motion-reduce:[&>*]:[transition:none] motion-reduce:[&>[data-slot=select-list]>*]:[transition:none]",
        ),
        className,
      )}
      {...props}
    />
  )
}

function SelectItem<T = string>({ className, ...props }: React.ComponentProps<typeof SelectItemPart<T>>) {
  return <SelectItemPart<T> className={withClass("data-highlighted:[anchor-name:--kf-hl]", className)} {...props} />
}

function SelectSelectAll({ className, ...props }: React.ComponentProps<typeof SelectSelectAllPart>) {
  return <SelectSelectAllPart className={withClass("data-highlighted:[anchor-name:--kf-hl]", className)} {...props} />
}

/* Draw: the check's stroke draws in when its item is chosen, and again as the list unfolds.
   Works with any check path up to 24 units long. */
function SelectItemIndicator({ className, ...props }: React.ComponentProps<typeof SelectItemIndicatorPart>) {
  return (
    <SelectItemIndicatorPart
      className={withClass(
        cn(
          "[&_:is(path,polyline)]:[stroke-dasharray:24] [&_:is(path,polyline)]:[stroke-dashoffset:24]",
          "[&_:is(path,polyline)]:transition-[stroke-dashoffset] [&_:is(path,polyline)]:duration-[calc(260ms*var(--kf-speed,1))] [&_:is(path,polyline)]:ease-house",
          "data-selected:[&_:is(path,polyline)]:[stroke-dashoffset:0] data-selected:[&_:is(path,polyline)]:delay-[calc(100ms*var(--kf-speed,1))]",
          "data-selected:[&_:is(path,polyline)]:starting:[stroke-dashoffset:24]",
          "group-data-starting-style/kf-select:[&_:is(path,polyline)]:[stroke-dashoffset:24]!",
          "motion-reduce:[&_:is(path,polyline)]:transition-none",
        ),
        className,
      )}
      {...props}
    />
  )
}

export { SelectContent, SelectItem, SelectItemIndicator, SelectSelectAll, SelectTrigger, SelectValue }
