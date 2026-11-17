"use client"

/* Animated drop-in for `@ui-sdk/react/navigation-menu`: same parts, same props. Swap the import and keep your code.
   This file adds motion only. Colours, radii, shadows and spacing stay yours.

   - Indicator: Stretch. It travels under the open trigger: the edge facing the way it goes leaves at
     once, the other follows 80ms later, so it stretches across the gap and closes up.
   - Viewport: Unfold from the trigger, then resizes and moves on a spring as panels trade places.
   - Content: Direction. A panel comes 28px from the side it was reached from, with 6px blur; the old
     one leaves the other way. Its links (the panel's grandchildren, as in ul > li) Cascade in.
   - Triggers: Press; their chevron turns on a spring. */

import {
  NavigationMenuContent as NavigationMenuContentPart,
  NavigationMenuIndicator as NavigationMenuIndicatorPart,
  NavigationMenuTrigger as NavigationMenuTriggerPart,
  NavigationMenuViewport as NavigationMenuViewportPart,
} from "@ui-sdk/react/navigation-menu"
import * as React from "react"

import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

export * from "@ui-sdk/react/navigation-menu"

/* The same registered properties as the tabs key (shared by href). */
const stretchProperties = ["la", "lb", "ra", "rb", "ta", "tb", "ba", "bb"]
  .map((n) => `@property --kf-${n}{syntax:"<length>";inherits:true;initial-value:0px}`)
  .join("")

function NavigationMenuTrigger({ className, ...props }: React.ComponentProps<typeof NavigationMenuTriggerPart>) {
  return (
    <NavigationMenuTriggerPart
      className={withClass(
        cn(
          "transition-[scale] duration-[calc(200ms*var(--kf-speed,1))] ease-pop active:scale-[0.96]",
          "[&>svg]:transition-[rotate] [&>svg]:duration-[calc(460ms*var(--kf-speed,1))] [&>svg]:ease-spring data-open:[&>svg]:rotate-180",
          "motion-reduce:transition-none! motion-reduce:[&>svg]:transition-none",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* Stretch: each edge is tracked by a fast and a slow (calc(80ms*var(--kf-speed,1)) later) registered property, and the
   inset is the smaller of the two, so the leading edge leads in either direction with no direction
   attribute. Hidden while there is nothing to sit under, and it appears in place. */
function NavigationMenuIndicator({ className, ...props }: React.ComponentProps<typeof NavigationMenuIndicatorPart>) {
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
      <NavigationMenuIndicatorPart
        data-ready={ready || undefined}
        className={withClass(
          cn(
            "pointer-events-none absolute hidden data-visible:block",
            "[--kf-la:var(--active-item-left,0px)] [--kf-lb:var(--active-item-left,0px)] [--kf-ra:var(--active-item-right,0px)] [--kf-rb:var(--active-item-right,0px)]",
            "[--kf-ta:var(--active-item-top,0px)] [--kf-tb:var(--active-item-top,0px)] [--kf-ba:var(--active-item-bottom,0px)] [--kf-bb:var(--active-item-bottom,0px)]",
            "top-[min(var(--kf-ta),var(--kf-tb))] right-[min(var(--kf-ra),var(--kf-rb))] bottom-[min(var(--kf-ba),var(--kf-bb))] left-[min(var(--kf-la),var(--kf-lb))]",
            "motion-reduce:transition-none! data-ready:[transition:--kf-la_calc(260ms*var(--kf-speed,1))_var(--ease-house),--kf-ra_calc(260ms*var(--kf-speed,1))_var(--ease-house),--kf-ta_calc(260ms*var(--kf-speed,1))_var(--ease-house),--kf-ba_calc(260ms*var(--kf-speed,1))_var(--ease-house),--kf-lb_calc(380ms*var(--kf-speed,1))_var(--ease-house)_calc(80ms*var(--kf-speed,1)),--kf-rb_calc(380ms*var(--kf-speed,1))_var(--ease-house)_calc(80ms*var(--kf-speed,1)),--kf-tb_calc(380ms*var(--kf-speed,1))_var(--ease-house)_calc(80ms*var(--kf-speed,1)),--kf-bb_calc(380ms*var(--kf-speed,1))_var(--ease-house)_calc(80ms*var(--kf-speed,1)),opacity_calc(200ms*var(--kf-speed,1))_var(--ease-house)]",
            "starting:opacity-0",
            "motion-reduce:[transition:none]!",
          ),
          className,
        )}
        {...props}
      />
    </>
  )
}

/* Unfold, then follow the open item on a spring. */
function NavigationMenuViewport({ className, ...props }: React.ComponentProps<typeof NavigationMenuViewportPart>) {
  return (
    <NavigationMenuViewportPart
      className={withClass(
        cn(
          "origin-(--transform-origin)",
          "[transition:width_calc(440ms*var(--kf-speed,1))_var(--ease-spring),height_calc(440ms*var(--kf-speed,1))_var(--ease-spring),left_calc(440ms*var(--kf-speed,1))_var(--ease-spring),top_calc(440ms*var(--kf-speed,1))_var(--ease-spring),opacity_calc(380ms*var(--kf-speed,1))_var(--ease-spring),scale_calc(380ms*var(--kf-speed,1))_var(--ease-spring),translate_calc(380ms*var(--kf-speed,1))_var(--ease-spring),filter_calc(380ms*var(--kf-speed,1))_var(--ease-spring)]",
          "data-[side=bottom]:[--kf-from:0_-8px] data-[side=top]:[--kf-from:0_8px] data-[side=left]:[--kf-from:8px_0] data-[side=right]:[--kf-from:-8px_0]",
          "data-starting-style:[translate:var(--kf-from,0_0)] data-starting-style:scale-[0.86] data-starting-style:opacity-0 data-starting-style:blur-[6px]",
          "data-ending-style:scale-[0.96] data-ending-style:opacity-0 data-ending-style:blur-[2px]",
          "data-ending-style:[transition:width_calc(150ms*var(--kf-speed,1))_var(--ease-house),height_calc(150ms*var(--kf-speed,1))_var(--ease-house),left_calc(150ms*var(--kf-speed,1))_var(--ease-house),top_calc(150ms*var(--kf-speed,1))_var(--ease-house),opacity_calc(150ms*var(--kf-speed,1))_var(--ease-house),scale_calc(150ms*var(--kf-speed,1))_var(--ease-house),translate_calc(150ms*var(--kf-speed,1))_var(--ease-house),filter_calc(150ms*var(--kf-speed,1))_var(--ease-house)]",
          "motion-reduce:[transition:none]!",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* Direction + Cascade. */
function NavigationMenuContent({ className, ...props }: React.ComponentProps<typeof NavigationMenuContentPart>) {
  return (
    <NavigationMenuContentPart
      className={withClass(
        cn(
          "transition-[opacity,translate,filter] duration-[calc(460ms*var(--kf-speed,1))] ease-spring",
          "data-ending-style:duration-[calc(200ms*var(--kf-speed,1))] data-ending-style:ease-house",
          "data-[motion=from-end]:data-starting-style:translate-x-7 data-[motion=from-start]:data-starting-style:-translate-x-7",
          "data-[motion=to-start]:data-ending-style:-translate-x-6 data-[motion=to-end]:data-ending-style:translate-x-6",
          "rtl:data-[motion=from-end]:data-starting-style:-translate-x-7 rtl:data-[motion=from-start]:data-starting-style:translate-x-7",
          "rtl:data-[motion=to-start]:data-ending-style:translate-x-6 rtl:data-[motion=to-end]:data-ending-style:-translate-x-6",
          "data-motion:data-starting-style:opacity-0 data-motion:data-starting-style:blur-[6px]",
          "data-motion:data-ending-style:opacity-0 data-motion:data-ending-style:blur-[6px]",
          /* Cascade the links (grandchildren, as in ul > li) while the panel arrives. */
          "[&>*>*]:transition-[opacity,translate,filter] [&>*>*]:duration-[calc(420ms*var(--kf-speed,1))] [&>*>*]:ease-spring",
          "[&>*>*]:[transition-delay:calc((min(sibling-index(),10)-1)*calc(32ms*var(--kf-speed,1)))]",
          "data-starting-style:[&>*>*]:translate-y-2 data-starting-style:[&>*>*]:opacity-0 data-starting-style:[&>*>*]:blur-[4px] data-starting-style:[&>*>*]:[transition:none]",
          "data-ending-style:[&>*>*]:[transition-delay:0ms]",
          "motion-reduce:transition-none! motion-reduce:[&>*>*]:transition-none",
        ),
        className,
      )}
      {...props}
    />
  )
}

export { NavigationMenuContent, NavigationMenuIndicator, NavigationMenuTrigger, NavigationMenuViewport }
