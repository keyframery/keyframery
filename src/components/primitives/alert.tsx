"use client"

/* Animated alert, on UI SDK's core. UI SDK ships no alert, so the behaviour is defined in
   `@/components/core/alert` with `definePrimitive` and rendered here. This file adds motion only.
   Colours, radii, shadows and spacing stay yours.

   - Arrives: drops 12px into place out of a 6px blur, growing from 0.96, on a spring
     (`data-starting-style`, set by UI SDK's `animateIn`).
   - The icon (an `svg` placed directly in the alert) pops in with `ease-pop`, then its strokes draw.
   - Title and description cascade in after it.
   - Leaves: fades, blurs and folds its height away (`data-ending-style`, from `animateOut`), so
     what sits under it closes up instead of jumping.
   - Flourish: the drop beyond 8px, the blur, the icon's pop and draw, the cascade and the press dip
     scale with --kf-flourish; at 0 the alert fades in with a small scale and its parts are simply there. */

import { createParts } from "@ui-sdk/react/primitive"
import * as React from "react"

import { alert } from "@/components/core/alert"
import { cn } from "@/lib/utils"

/* `className` may be a string or a function of the part's state: keep both working. */
function withClass<C>(className: C, ...base: string[]): C {
  return (typeof className === "function"
    ? (state: unknown) => cn(...base, (className as (state: unknown) => string | undefined)(state))
    : cn(...base, className as string | undefined)) as C
}

const {
  Root: AlertRoot,
  Title: AlertTitlePart,
  Description: AlertDescriptionPart,
  Close: AlertClosePart,
} = createParts(alert, { root: "div", title: "div", description: "div", close: "button" })

/* Rows rise out of a blur; the icon pops; its strokes draw. Under reduced motion only the fade is left. */
const keyframes =
  "@keyframes kf-alert-rise{from{opacity:0;translate:0 6px;filter:blur(4px)}}" +
  "@keyframes kf-alert-pop{from{opacity:0;scale:0.4}}" +
  "@keyframes kf-alert-draw{from{stroke-dasharray:80;stroke-dashoffset:80}to{stroke-dasharray:80;stroke-dashoffset:0}}" +
  "@media (prefers-reduced-motion:reduce){@keyframes kf-alert-rise{from{opacity:0}}@keyframes kf-alert-pop{from{opacity:0}}@keyframes kf-alert-draw{from{opacity:1}}}"

function Alert({ className, children, ...props }: React.ComponentProps<typeof AlertRoot>) {
  return (
    <>
      <style href="kf-alert" precedence="default">
        {keyframes}
      </style>
      <AlertRoot
        className={withClass(className, "group/alert [interpolate-size:allow-keywords]",
          "transition-[opacity,translate,scale,filter,height,padding-block,margin-block] duration-[calc(520ms*var(--kf-speed,1))] ease-spring",
          "data-starting-style:-translate-y-[calc(0.5rem+0.25rem*var(--kf-flourish,1))] data-starting-style:scale-[0.96] data-starting-style:opacity-0 data-starting-style:blur-[calc(6px*var(--kf-flourish,1))]",
          "data-ending-style:h-0 data-ending-style:overflow-hidden data-ending-style:py-0 data-ending-style:my-0",
          "data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-ending-style:blur-[calc(4px*var(--kf-flourish,1))]",
          "data-ending-style:duration-[calc(260ms*var(--kf-speed,1))] data-ending-style:ease-house",
          /* The icon: pops in, then draws. */
          "[&>svg]:origin-center [&>svg]:animate-[kf-alert-pop_calc(460ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-pop)_backwards] [&>svg]:[animation-delay:calc(70ms*var(--kf-speed,1)*var(--kf-flourish,1))]",
          "[&>svg_*]:animate-[kf-alert-draw_calc(620ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-house)_backwards] [&>svg_*]:[animation-delay:calc(170ms*var(--kf-speed,1)*var(--kf-flourish,1))]",
          "motion-reduce:transition-none! motion-reduce:[&>svg]:animate-none motion-reduce:[&>svg_*]:animate-none")}
        {...props}
      >
        {children}
      </AlertRoot>
    </>
  )
}

const rise = "animate-[kf-alert-rise_calc(480ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-spring)_backwards] motion-reduce:animate-none"

function AlertTitle({ className, ...props }: React.ComponentProps<typeof AlertTitlePart>) {
  return <AlertTitlePart className={withClass(className, rise, "[animation-delay:calc(110ms*var(--kf-speed,1)*var(--kf-flourish,1))]")} {...props} />
}

function AlertDescription({ className, ...props }: React.ComponentProps<typeof AlertDescriptionPart>) {
  return <AlertDescriptionPart className={withClass(className, rise, "[animation-delay:calc(170ms*var(--kf-speed,1)*var(--kf-flourish,1))]")} {...props} />
}

/* Press: dips and pops back. It arrives with the rows. */
function AlertClose({ className, ...props }: React.ComponentProps<typeof AlertClosePart>) {
  return (
    <AlertClosePart
      className={withClass(className, rise,
        "[animation-delay:calc(200ms*var(--kf-speed,1)*var(--kf-flourish,1))]",
        "transition-[scale] duration-[calc(200ms*var(--kf-speed,1))] ease-pop active:scale-[calc(1-0.12*var(--kf-flourish,1))] motion-reduce:transition-none")}
      {...props}
    />
  )
}

export { Alert, AlertClose, AlertDescription, AlertTitle }
