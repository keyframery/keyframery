"use client"

/* Animated drop-in for `@ui-sdk/react/switch`: same parts, same props. Swap the import and keep your code.
   This file adds motion only. Colours, radii, shadows and spacing stay yours. */

import { Switch as SwitchPart, SwitchThumb as SwitchThumbPart } from "@ui-sdk/react/switch"
import * as React from "react"

import { cn } from "@/lib/utils"

export * from "@ui-sdk/react/switch"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

/* The track is the thumb's positioning box. Size the thumb with two variables:
   `--kf-switch-thumb` (its resting width, 16px by default) and `--kf-switch-pad` (the gap
   to the track's edge, 2px). The thumb fills the track's height minus the pad. */
function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPart>) {
  return (
    <SwitchPart
      className={withClass("group/kf-switch relative [--kf-switch-pad:2px] [--kf-switch-thumb:16px]", className)}
      {...props}
    />
  )
}

/* Stretch: the thumb's two edges move separately. The edge facing the other side leaves at
   once and the far edge follows 80ms later, so the thumb stretches toward where it is going
   and closes up there. While the switch is held, the thumb widens by 4px toward the middle. */
function SwitchThumb({ className, ...props }: React.ComponentProps<typeof SwitchThumbPart>) {
  return (
    <SwitchThumbPart
      className={withClass(
        cn(
          "absolute top-(--kf-switch-pad) bottom-(--kf-switch-pad) w-auto",
          /* Off: hugs the start. On: hugs the end. */
          "left-(--kf-switch-pad) right-[calc(100%-var(--kf-switch-pad)-var(--kf-switch-thumb))]",
          "data-checked:right-(--kf-switch-pad) data-checked:left-[calc(100%-var(--kf-switch-pad)-var(--kf-switch-thumb))]",
          /* Held: 4px wider toward the middle. */
          "group-not-data-disabled/kf-switch:group-not-data-readonly/kf-switch:group-active/kf-switch:right-[calc(100%-var(--kf-switch-pad)-var(--kf-switch-thumb)-4px)]",
          "group-not-data-disabled/kf-switch:group-not-data-readonly/kf-switch:group-active/kf-switch:data-checked:right-(--kf-switch-pad)",
          "group-not-data-disabled/kf-switch:group-not-data-readonly/kf-switch:group-active/kf-switch:data-checked:left-[calc(100%-var(--kf-switch-pad)-var(--kf-switch-thumb)-4px)]",
          /* The leading edge goes first, the trailing edge 80ms later. */
          "data-checked:[transition:right_calc(260ms*var(--kf-speed,1))_var(--ease-spring),left_calc(420ms*var(--kf-speed,1))_var(--ease-spring)_calc(80ms*var(--kf-speed,1)),background-color_calc(200ms*var(--kf-speed,1)),box-shadow_calc(200ms*var(--kf-speed,1))]",
          "data-unchecked:[transition:left_calc(260ms*var(--kf-speed,1))_var(--ease-spring),right_calc(420ms*var(--kf-speed,1))_var(--ease-spring)_calc(80ms*var(--kf-speed,1)),background-color_calc(200ms*var(--kf-speed,1)),box-shadow_calc(200ms*var(--kf-speed,1))]",
          "group-active/kf-switch:[transition:left_calc(200ms*var(--kf-speed,1))_var(--ease-pop),right_calc(200ms*var(--kf-speed,1))_var(--ease-pop),background-color_calc(200ms*var(--kf-speed,1)),box-shadow_calc(200ms*var(--kf-speed,1))]!",
          "motion-reduce:[transition:none]!",
        ),
        className,
      )}
      {...props}
    />
  )
}

export { Switch, SwitchThumb }
