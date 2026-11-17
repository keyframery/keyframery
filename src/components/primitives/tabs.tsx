"use client"

/* Animated drop-in for `@ui-sdk/react/tabs`: same parts, same props. Swap the import and keep your code.
   This file adds motion only. Colours, radii, shadows and spacing stay yours. */

import {
  TabsIndicator as TabsIndicatorPart,
  TabsList as TabsListPart,
  TabsPanel as TabsPanelPart,
  TabsTab as TabsTabPart,
} from "@ui-sdk/react/tabs"
import * as React from "react"

import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

export * from "@ui-sdk/react/tabs"

function TabsList({ className, ...props }: React.ComponentProps<typeof TabsListPart>) {
  return <TabsListPart className={withClass("relative isolate", className)} {...props} />
}

function TabsTab({ className, ...props }: React.ComponentProps<typeof TabsTabPart>) {
  return (
    <TabsTabPart
      className={withClass("transition-[scale] duration-[calc(150ms*var(--kf-speed,1))] ease-spring active:scale-[0.96] motion-reduce:transition-none!", className)}
      {...props}
    />
  )
}

/* Stretch: every edge of the marker is tracked twice, once quickly and once slowly with a
   70ms lag. Each edge then uses whichever of the two is further out, so the edge facing the
   direction of travel leads and the opposite edge follows: the marker stretches toward where
   it is going, then closes up. (No spring here: an overshoot would push it out of its track.) It needs no direction attribute, so it is right on the
   first move and in both directions. The registered properties are inherited, so anything
   inside the indicator can read the same moving edges. */
const stretchProperties = ["la", "lb", "ra", "rb", "ta", "tb", "ba", "bb"]
  .map((n) => `@property --kf-${n}{syntax:"<length>";inherits:true;initial-value:0px}`)
  .join("")

function TabsIndicator({ className, ...props }: React.ComponentProps<typeof TabsIndicatorPart>) {
  /* Hold the transitions until UI SDK has measured the first tab, so the marker
     is simply there on load instead of sliding in from the corner. */
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
      <TabsIndicatorPart
        data-ready={ready || undefined}
        className={withClass(
          cn(
            "pointer-events-none absolute",
            "[--kf-la:var(--active-tab-left,0px)] [--kf-lb:var(--active-tab-left,0px)] [--kf-ra:var(--active-tab-right,0px)] [--kf-rb:var(--active-tab-right,0px)]",
            "[--kf-ba:var(--active-tab-bottom,0px)] [--kf-bb:var(--active-tab-bottom,0px)] [--kf-ta:var(--active-tab-top,0px)] [--kf-tb:var(--active-tab-top,0px)]",
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

/* Optional: put the panels inside TabsPanels and the one leaving overlaps the one
   arriving. Without it, the old panel leaves at once and the new one still animates in. */
function TabsPanels({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="tabs-panels" className={cn("group/panels grid min-w-0", className)} {...props} />
}

function TabsPanel({ className, ...props }: React.ComponentProps<typeof TabsPanelPart>) {
  return (
    <TabsPanelPart
      className={withClass(
        cn(
          "transition-[opacity,translate,filter] duration-[calc(460ms*var(--kf-speed,1))] ease-spring",
          "data-starting-style:opacity-0 data-starting-style:blur-[6px]",
          "data-[activation-direction=right]:data-starting-style:translate-x-8 data-[activation-direction=left]:data-starting-style:-translate-x-8",
          "data-[activation-direction=down]:data-starting-style:translate-y-6 data-[activation-direction=up]:data-starting-style:-translate-y-6",
          "data-ending-style:hidden",
          "group-data-[slot=tabs-panels]/panels:[grid-area:1/1] group-data-[slot=tabs-panels]/panels:data-ending-style:block",
          "data-ending-style:opacity-0 data-ending-style:blur-[6px] data-ending-style:duration-[calc(200ms*var(--kf-speed,1))] data-ending-style:ease-house",
          "data-[activation-direction=right]:data-ending-style:-translate-x-6 data-[activation-direction=left]:data-ending-style:translate-x-6",
          "data-[activation-direction=down]:data-ending-style:-translate-y-4 data-[activation-direction=up]:data-ending-style:translate-y-4",
          "motion-reduce:transition-none!",
        ),
        className,
      )}
      {...props}
    />
  )
}

export { TabsIndicator, TabsList, TabsPanel, TabsPanels, TabsTab }
