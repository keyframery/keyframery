"use client"

/* Animated drop-in for `@ui-sdk/react/segmented-control`: same parts, same props. Swap the import and
   keep your code. This file adds motion only. Colours, radii, shadows and spacing stay yours. */

import {
  SegmentedControl as SegmentedControlRoot,
  SegmentedControlIndicator as SegmentedControlIndicatorPart,
  SegmentedControlItem as SegmentedControlItemPart,
} from "@ui-sdk/react/segmented-control"
import * as React from "react"

import { cn } from "@/lib/utils"

export * from "@ui-sdk/react/segmented-control"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

function SegmentedControl({ className, ...props }: React.ComponentProps<typeof SegmentedControlRoot>) {
  return <SegmentedControlRoot className={withClass("relative isolate", className)} {...props} />
}

function SegmentedControlItem({ className, ...props }: React.ComponentProps<typeof SegmentedControlItemPart>) {
  return (
    <SegmentedControlItemPart
      className={withClass(
        "transition-[scale] duration-[calc(200ms*var(--kf-speed,1))] ease-pop not-data-disabled:not-data-readonly:active:scale-[0.96] motion-reduce:transition-none!",
        className,
      )}
      {...props}
    />
  )
}

/* Stretch, the same recipe as the tabs primitive: every edge of the marker is tracked twice,
   once quickly and once slowly with an 80ms lag, and each edge uses whichever of the two is
   further out. The edge facing the direction of travel leads, the other follows, so the
   marker stretches toward the item you pick and closes up there. The registered properties
   are inherited, so anything inside the indicator can read the same moving edges. */
const stretchProperties = ["la", "lb", "ra", "rb", "ta", "tb", "ba", "bb"]
  .map((n) => `@property --kf-${n}{syntax:"<length>";inherits:true;initial-value:0px}`)
  .join("")

function SegmentedControlIndicator({
  className,
  ...props
}: React.ComponentProps<typeof SegmentedControlIndicatorPart>) {
  /* Hold the transitions until UI SDK has measured the checked item, so the marker is
     simply there on load instead of sliding in from the corner. */
  const [ready, setReady] = React.useState(false)
  React.useEffect(() => {
    const timer = setTimeout(() => setReady(true), 150)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      <style href="kf-stretch" precedence="default">
        {stretchProperties}
      </style>
      <SegmentedControlIndicatorPart
        data-ready={ready || undefined}
        className={withClass(
          cn(
            "pointer-events-none absolute",
            /* No box while nothing is checked. */
            "[[data-slot=segmented-control]:not(:has([data-checked]))>&]:invisible",
            "[--kf-la:var(--segmented-control-indicator-left,0px)] [--kf-lb:var(--segmented-control-indicator-left,0px)]",
            "[--kf-ra:var(--segmented-control-indicator-right,0px)] [--kf-rb:var(--segmented-control-indicator-right,0px)]",
            "[--kf-ta:var(--segmented-control-indicator-top,0px)] [--kf-tb:var(--segmented-control-indicator-top,0px)]",
            "[--kf-ba:var(--segmented-control-indicator-bottom,0px)] [--kf-bb:var(--segmented-control-indicator-bottom,0px)]",
            "top-[min(var(--kf-ta),var(--kf-tb))] right-[min(var(--kf-ra),var(--kf-rb))] bottom-[min(var(--kf-ba),var(--kf-bb))] left-[min(var(--kf-la),var(--kf-lb))]",
            "motion-reduce:transition-none! data-ready:[transition:--kf-la_calc(260ms*var(--kf-speed,1))_var(--ease-house),--kf-ra_calc(260ms*var(--kf-speed,1))_var(--ease-house),--kf-ta_calc(260ms*var(--kf-speed,1))_var(--ease-house),--kf-ba_calc(260ms*var(--kf-speed,1))_var(--ease-house),--kf-lb_calc(380ms*var(--kf-speed,1))_var(--ease-house)_calc(80ms*var(--kf-speed,1)),--kf-rb_calc(380ms*var(--kf-speed,1))_var(--ease-house)_calc(80ms*var(--kf-speed,1)),--kf-tb_calc(380ms*var(--kf-speed,1))_var(--ease-house)_calc(80ms*var(--kf-speed,1)),--kf-bb_calc(380ms*var(--kf-speed,1))_var(--ease-house)_calc(80ms*var(--kf-speed,1))]",
            "motion-reduce:[transition:none]!",
          ),
          className,
        )}
        {...props}
      />
    </>
  )
}

export { SegmentedControl, SegmentedControlIndicator, SegmentedControlItem }
