"use client"

/* Animated drop-in for `@ui-sdk/react/menu`: same parts, same props. Swap the import and keep your code.
   This file adds motion only. Colours, radii, shadows and spacing stay yours.

   - Content and submenus: Unfold from the trigger (scale 0.86, 6px blur, 8px toward it; spring in, quick out).
     A submenu unfolds sideways, from the row that opened it.
   - Rows: Cascade in, one after another, as the sheet opens.
   - Glide: one highlight springs from row to row (CSS anchor positioning), instead of each row lighting up.
     Its neutral surface follows the text colour; give `before:bg-…` and `before:rounded-…` to restyle it.
   - Checks: Draw themselves. Trigger: Press. */

import {
  MenuCheckboxItem as MenuCheckboxItemPart,
  MenuContent as MenuContentPart,
  MenuItem as MenuItemPart,
  MenuItemIndicator as MenuItemIndicatorPart,
  MenuRadioItem as MenuRadioItemPart,
  MenuSubContent as MenuSubContentPart,
  MenuSubTrigger as MenuSubTriggerPart,
  MenuTrigger as MenuTriggerPart,
} from "@ui-sdk/react/menu"
import * as React from "react"

import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

export * from "@ui-sdk/react/menu"

/* Unfold + Cascade + Glide, shared by the content and its submenus. The cascade runs on the
   direct children (rows, groups, separators), never on a nested submenu. */
const sheet = cn(
  "group/kf-menu origin-(--transform-origin)",
  "[transition:opacity_calc(380ms*var(--kf-speed,1))_var(--ease-spring),scale_calc(380ms*var(--kf-speed,1))_var(--ease-spring),translate_calc(380ms*var(--kf-speed,1))_var(--ease-spring),filter_calc(380ms*var(--kf-speed,1))_var(--ease-spring)]",
  "data-[side=bottom]:[--kf-from:0_-8px] data-[side=top]:[--kf-from:0_8px] data-[side=left]:[--kf-from:8px_0] data-[side=right]:[--kf-from:-8px_0]",
  "data-[side=inline-end]:[--kf-from:-8px_0] data-[side=inline-start]:[--kf-from:8px_0]",
  "data-starting-style:[translate:var(--kf-from,0_0)] data-starting-style:scale-[0.86] data-starting-style:opacity-0 data-starting-style:blur-[6px]",
  "data-ending-style:scale-[0.96] data-ending-style:opacity-0 data-ending-style:blur-[2px]",
  "data-ending-style:[transition:opacity_calc(150ms*var(--kf-speed,1))_var(--ease-house),scale_calc(150ms*var(--kf-speed,1))_var(--ease-house),translate_calc(150ms*var(--kf-speed,1))_var(--ease-house),filter_calc(150ms*var(--kf-speed,1))_var(--ease-house)]",
  /* Cascade */
  "[&>*:not([data-slot=menu-content])]:transition-[opacity,translate,filter] [&>*:not([data-slot=menu-content])]:duration-[calc(420ms*var(--kf-speed,1))] [&>*:not([data-slot=menu-content])]:ease-spring",
  "[&>*:not([data-slot=menu-content])]:[transition-delay:calc((min(sibling-index(),10)-1)*calc(32ms*var(--kf-speed,1)))]",
  "data-starting-style:[&>*:not([data-slot=menu-content])]:translate-y-2 data-starting-style:[&>*:not([data-slot=menu-content])]:opacity-0 data-starting-style:[&>*:not([data-slot=menu-content])]:blur-[4px]",
  "data-ending-style:[&>*:not([data-slot=menu-content])]:[transition-delay:0ms]",
  "motion-reduce:[&>*:not([data-slot=menu-content])]:[translate:none]! motion-reduce:[&>*:not([data-slot=menu-content])]:[filter:none]! data-starting-style:[&>*:not([data-slot=menu-content])]:[transition:none]",
  /* Glide */
  "relative isolate [anchor-scope:--kf-hl]",
  "before:pointer-events-none before:absolute before:-z-10 before:hidden before:bg-[color-mix(in_oklch,currentColor_9%,transparent)]",
  "before:[position-anchor:--kf-hl] before:top-[anchor(top)] before:right-[anchor(right)] before:bottom-[anchor(bottom)] before:left-[anchor(left)]",
  "before:[transition:top_calc(260ms*var(--kf-speed,1))_var(--ease-spring),right_calc(260ms*var(--kf-speed,1))_var(--ease-spring),bottom_calc(260ms*var(--kf-speed,1))_var(--ease-spring),left_calc(260ms*var(--kf-speed,1))_var(--ease-spring),opacity_calc(150ms*var(--kf-speed,1))_var(--ease-house)]",
  "has-[[data-highlighted],[data-slot=menu-trigger][data-open]]:before:block starting:before:opacity-0",
  "motion-reduce:[transition:none]! motion-reduce:before:[transition:none]! motion-reduce:[&>*]:[transition:none]",
)

/* A row anchors the highlight while it is highlighted. */
const row = "data-highlighted:[anchor-name:--kf-hl]"

function MenuTrigger({ className, ...props }: React.ComponentProps<typeof MenuTriggerPart>) {
  return (
    <MenuTriggerPart
      className={withClass("transition-[scale] duration-[calc(200ms*var(--kf-speed,1))] ease-pop active:scale-[0.96] motion-reduce:transition-none!", className)}
      {...props}
    />
  )
}

function MenuContent<Payload = unknown>({
  className,
  ...props
}: React.ComponentProps<typeof MenuContentPart<Payload>>) {
  return <MenuContentPart<Payload> className={withClass(sheet, className)} {...props} />
}

/* For a menu opened by a `MenuContextTrigger` (a right-click, a long press or Shift+F10). It has no
   trigger to grow out of: UI SDK anchors it to the press point and puts that point in
   `--transform-origin`. So the sheet starts smaller, does not slide toward a trigger, and grows
   straight out of the pointer. Add it to the content: `<MenuContent className={contextMenuMotion}>`. */
const contextMenuMotion = cn(
  "data-starting-style:[translate:0_0] data-starting-style:scale-[0.6] data-starting-style:blur-[8px]",
  "data-ending-style:scale-[0.94]",
  /* Reduced motion: appear in place, no scale or blur. */
  "motion-reduce:data-starting-style:scale-100 motion-reduce:data-starting-style:blur-none motion-reduce:data-ending-style:scale-100",
)

function MenuSubContent<Payload = unknown>({
  className,
  ...props
}: React.ComponentProps<typeof MenuSubContentPart<Payload>>) {
  return <MenuSubContentPart<Payload> className={withClass(sheet, className)} {...props} />
}

function MenuItem({ className, ...props }: React.ComponentProps<typeof MenuItemPart>) {
  return <MenuItemPart className={withClass(row, className)} {...props} />
}

function MenuCheckboxItem({ className, ...props }: React.ComponentProps<typeof MenuCheckboxItemPart>) {
  return <MenuCheckboxItemPart className={withClass(row, className)} {...props} />
}

function MenuRadioItem({ className, ...props }: React.ComponentProps<typeof MenuRadioItemPart>) {
  return <MenuRadioItemPart className={withClass(row, className)} {...props} />
}

/* Keeps the highlight while its submenu is open; its chevron (the last svg) nudges toward it. */
function MenuSubTrigger({ className, ...props }: React.ComponentProps<typeof MenuSubTriggerPart>) {
  return (
    <MenuSubTriggerPart
      className={withClass(
        cn(
          row,
          "data-open:[anchor-name:--kf-hl]",
          "[&>svg:last-child]:transition-[translate] [&>svg:last-child]:duration-[calc(380ms*var(--kf-speed,1))] [&>svg:last-child]:ease-spring data-open:[&>svg:last-child]:translate-x-0.5 rtl:data-open:[&>svg:last-child]:-translate-x-0.5",
          "motion-reduce:[&>svg:last-child]:transition-none",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* Draw: the check's stroke draws in when its item turns on, and again as the sheet unfolds.
   Works with any check path up to 24 units long (a 16 or 24 unit icon). */
function MenuItemIndicator({ className, ...props }: React.ComponentProps<typeof MenuItemIndicatorPart>) {
  return (
    <MenuItemIndicatorPart
      className={withClass(
        cn(
          "[&_:is(path,polyline)]:[stroke-dasharray:24] [&_:is(path,polyline)]:[stroke-dashoffset:24]",
          "[&_:is(path,polyline)]:transition-[stroke-dashoffset] [&_:is(path,polyline)]:duration-[calc(260ms*var(--kf-speed,1))] [&_:is(path,polyline)]:ease-house",
          "data-checked:[&_:is(path,polyline)]:[stroke-dashoffset:0] data-checked:[&_:is(path,polyline)]:delay-[calc(100ms*var(--kf-speed,1))]",
          "data-checked:[&_:is(path,polyline)]:starting:[stroke-dashoffset:24]",
          "group-data-starting-style/kf-menu:[&_:is(path,polyline)]:[stroke-dashoffset:24]!",
          "motion-reduce:[&_:is(path,polyline)]:transition-none",
        ),
        className,
      )}
      {...props}
    />
  )
}

export {
  contextMenuMotion,
  MenuCheckboxItem,
  MenuContent,
  MenuItem,
  MenuItemIndicator,
  MenuRadioItem,
  MenuSubContent,
  MenuSubTrigger,
  MenuTrigger,
}
