"use client"

/* Animated drop-in for `@ui-sdk/react/toast`: same parts, same props. Swap the import and keep your code.
   This file adds motion only, plus the positioning a stack needs to move. Colours, radii,
   shadows and spacing stay yours.

   - Region: pinned to its side and corner; as tall as the front toast, growing to the whole stack
     while hovered or focused.
   - Toast: arrives on a spring from the region's edge, from scale 0.9. Collapsed, the toasts behind
     peek out 10px each and shrink 5% each, their content faded; expanded, each moves by the height
     of the toasts in front of it plus a 10px gap. A swipe drags it, and a dismissing swipe sends it
     on out the same way.
   - Action and close: Press. */

import {
  Toast as ToastPart,
  ToastAction as ToastActionPart,
  ToastClose as ToastClosePart,
  ToastRegion as ToastRegionPart,
} from "@ui-sdk/react/toast"
import * as React from "react"

import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

export * from "@ui-sdk/react/toast"

/* Pressed parts shrink; the toast's own child transition (scale on `ease-pop`) springs them back. */
const press = "active:scale-[0.92]"

function ToastRegion({ className, ...props }: React.ComponentProps<typeof ToastRegionPart>) {
  return (
    <ToastRegionPart
      className={withClass(
        cn(
          "fixed z-50 m-0 w-[360px] max-w-[calc(100vw-32px)] overflow-visible border-0 bg-transparent p-0 text-start",
          "[--dir:-1] data-[side=top]:[--dir:1]",
          "data-[side=bottom]:top-auto data-[side=bottom]:bottom-[calc(16px+var(--keyboard-inset,0px))] data-[side=top]:top-4 data-[side=top]:bottom-auto",
          "data-[align=end]:right-4 data-[align=end]:left-auto data-[align=start]:right-auto data-[align=start]:left-4",
          "data-[align=center]:right-auto data-[align=center]:left-1/2 data-[align=center]:-translate-x-1/2",
          "h-(--toast-front-height) data-expanded:h-[calc(var(--toast-stack-height)+(var(--toast-count)-1)*10px)]",
          "transition-[height] duration-[calc(380ms*var(--kf-speed,1))] ease-house motion-reduce:transition-none!",
        ),
        className,
      )}
      {...props}
    />
  )
}

function Toast({ className, ...props }: React.ComponentProps<typeof ToastPart>) {
  return (
    <ToastPart
      className={withClass(
        cn(
          "absolute inset-x-0 overflow-hidden select-none",
          "in-data-[side=bottom]:bottom-0 in-data-[side=top]:top-0",
          /* The stack. */
          "z-[calc(100-var(--toast-index))] h-(--toast-height) not-data-front:not-data-expanded:h-(--toast-front-height)",
          "[--y:calc(var(--toast-index)*10px*var(--dir))] [scale:calc(1-var(--toast-index)*0.05)]",
          "data-expanded:[--y:calc((var(--toast-offset)+var(--toast-index)*10px)*var(--dir))] data-expanded:[scale:1]",
          "[translate:calc(var(--toast-swipe-x,0px)+var(--exit-x,0px))_calc(var(--y)+var(--toast-swipe-y,0px)+var(--exit-y,0px))]",
          "origin-[50%_calc(50%-50%*var(--dir))]",
          "[transition:translate_calc(560ms*var(--kf-speed,1))_var(--ease-spring),scale_calc(560ms*var(--kf-speed,1))_var(--ease-spring),height_calc(380ms*var(--kf-speed,1))_var(--ease-house),opacity_calc(280ms*var(--kf-speed,1))_var(--ease-house),filter_calc(280ms*var(--kf-speed,1))_var(--ease-house)]",
          /* Content behind the front toast fades, so only its edge peeks out. The same rule carries
             the springy release of anything pressed inside (action, close). */
          "*:transition-[opacity,scale] *:duration-[calc(300ms*var(--kf-speed,1))] *:ease-pop not-data-front:not-data-expanded:*:opacity-0",
          /* Arriving: from beyond the region's edge, small and soft, on a spring. */
          "data-starting-style:data-front:[--y:calc(-110%*var(--dir))] data-starting-style:data-front:[scale:0.9]",
          "data-starting-style:opacity-0 data-starting-style:blur-[4px]",
          /* Leaving: quick and quiet; after a swipe it carries on out the way it was thrown. */
          "data-ending-style:opacity-0 data-ending-style:blur-[3px]",
          "data-ending-style:[transition:translate_calc(220ms*var(--kf-speed,1))_var(--ease-house),scale_calc(200ms*var(--kf-speed,1))_var(--ease-house),opacity_calc(200ms*var(--kf-speed,1))_var(--ease-house),filter_calc(200ms*var(--kf-speed,1))_var(--ease-house)]",
          "data-ending-style:not-data-swipe-direction:[scale:0.94]",
          "data-ending-style:data-[swipe-direction=right]:[--exit-x:100%] data-ending-style:data-[swipe-direction=left]:[--exit-x:-100%]",
          "data-ending-style:data-[swipe-direction=down]:[--exit-y:100%] data-ending-style:data-[swipe-direction=up]:[--exit-y:-100%]",
          "data-swiping:[transition:none] data-swiping:*:transition-none",
          "motion-reduce:[transition:opacity_calc(200ms*var(--kf-speed,1))] motion-reduce:*:transition-none",
        ),
        className,
      )}
      {...props}
    />
  )
}

function ToastAction({ className, ...props }: React.ComponentProps<typeof ToastActionPart>) {
  return <ToastActionPart className={withClass(press, className)} {...props} />
}

function ToastClose({ className, ...props }: React.ComponentProps<typeof ToastClosePart>) {
  return <ToastClosePart className={withClass(press, className)} {...props} />
}

export { Toast, ToastAction, ToastClose, ToastRegion }
