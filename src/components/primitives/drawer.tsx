"use client"

/* Animated drop-in for `@ui-sdk/react/drawer`: same parts, same props. Swap the import and keep
   your code. This file adds motion only. Colours, radii, shadows and spacing stay yours.
   The sheet itself moves on UI SDK's own spring, which follows the finger; nothing here touches
   its translate or the backdrop's opacity. */

import {
  DrawerClose as DrawerClosePart,
  DrawerContent as DrawerContentPart,
  DrawerTrigger as DrawerTriggerPart,
} from "@ui-sdk/react/drawer"
import * as React from "react"

import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

export * from "@ui-sdk/react/drawer"

/* Press: the key gives under the finger and springs back on release. */
const press =
  "transition-[scale] duration-[calc(200ms*var(--kf-speed,1))] ease-pop not-data-disabled:not-data-pending:active:scale-[0.96] motion-reduce:transition-none!"

/* Cascade: each direct child of the sheet rises in out of a blur a little after the one before
   it, while the sheet slides up. A keyframe animation, since the children have no earlier style
   to transition from when the sheet first appears. Close buttons are left out. */
const cascadeKeyframes = "@keyframes kf-cascade{from{opacity:0;translate:0 8px;filter:blur(4px)}}@media (prefers-reduced-motion:reduce){@keyframes kf-cascade{from{opacity:0}}}"

function DrawerTrigger({ className, ...props }: React.ComponentProps<typeof DrawerTriggerPart>) {
  return <DrawerTriggerPart className={withClass(press, className)} {...props} />
}

function DrawerClose({ className, ...props }: React.ComponentProps<typeof DrawerClosePart>) {
  return <DrawerClosePart className={withClass(press, className)} {...props} />
}

function DrawerContent({ className, ...props }: React.ComponentProps<typeof DrawerContentPart>) {
  return (
    <>
      <style href="kf-cascade" precedence="default">
        {cascadeKeyframes}
      </style>
      <DrawerContentPart
        className={withClass(
          cn(
            "[&>*:not([data-slot$=-close],[data-slot$=-arrow])]:animate-[kf-cascade_calc(420ms*var(--kf-speed,1))_var(--ease-spring)_backwards]",
            "[&>*:not([data-slot$=-close],[data-slot$=-arrow])]:[animation-delay:calc(calc(60ms*var(--kf-speed,1))+(min(sibling-index(),10)-1)*calc(40ms*var(--kf-speed,1)))]",
            /* While the sheet is dragged away, what is inside fades back with it. --drawer-progress
               does not inherit, so it is copied into a variable that does. */
            "[--kf-sheet-progress:var(--drawer-progress,1)] *:opacity-[calc(0.55+var(--kf-sheet-progress,1)*0.45)]",
            "motion-reduce:[&>*]:animate-none",
          ),
          className,
        )}
        {...props}
      />
    </>
  )
}

export { DrawerClose, DrawerContent, DrawerTrigger }
