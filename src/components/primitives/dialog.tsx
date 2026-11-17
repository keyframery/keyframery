"use client"

/* Animated drop-in for `@ui-sdk/react/dialog`: same parts, same props. Swap the import and keep
   your code. This file adds motion only. Colours, radii, shadows and spacing stay yours. */

import {
  DialogBackdrop as DialogBackdropPart,
  DialogClose as DialogClosePart,
  DialogContent as DialogContentPart,
  DialogTrigger as DialogTriggerPart,
} from "@ui-sdk/react/dialog"
import * as React from "react"

import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

export * from "@ui-sdk/react/dialog"

/* Press: the key gives under the finger and springs back on release. */
const press =
  "transition-[scale] duration-[calc(200ms*var(--kf-speed,1))] ease-pop not-data-disabled:not-data-pending:active:scale-[0.96] motion-reduce:transition-none!"

/* Cascade: each direct child of the content (a header, a body, a footer) rises in out of a blur a
   little after the one before it. It is a keyframe animation rather than a transition because the
   children have no earlier style to transition from when the content first appears. Close buttons
   and arrows are left out so their own presses stay quick, and nothing on the children transitions,
   so a hover is never delayed. */
const cascadeKeyframes = "@keyframes kf-cascade{from{opacity:0;translate:0 8px;filter:blur(4px)}}@media (prefers-reduced-motion:reduce){@keyframes kf-cascade{from{opacity:0}}}"
const cascade = cn(
  "[&>*:not([data-slot$=-close],[data-slot$=-arrow])]:animate-[kf-cascade_calc(420ms*var(--kf-speed,1))_var(--ease-spring)_backwards]",
  "[&>*:not([data-slot$=-close],[data-slot$=-arrow])]:[animation-delay:calc(calc(40ms*var(--kf-speed,1))+(min(sibling-index(),10)-1)*calc(40ms*var(--kf-speed,1)))]",
  "motion-reduce:[&>*]:animate-none",
)

function DialogTrigger({ className, ...props }: React.ComponentProps<typeof DialogTriggerPart>) {
  return <DialogTriggerPart className={withClass(press, className)} {...props} />
}

function DialogClose({ className, ...props }: React.ComponentProps<typeof DialogClosePart>) {
  return <DialogClosePart className={withClass(press, className)} {...props} />
}

/* The page behind softens into a blur as it dims, and clears faster than it came. */
function DialogBackdrop({ className, ...props }: React.ComponentProps<typeof DialogBackdropPart>) {
  return (
    <DialogBackdropPart
      className={withClass(
        cn(
          "backdrop-blur-[4px] transition-[opacity,backdrop-filter] duration-[calc(380ms*var(--kf-speed,1))] ease-house",
          "data-starting-style:opacity-0 data-starting-style:backdrop-blur-none",
          "data-ending-style:opacity-0 data-ending-style:backdrop-blur-none data-ending-style:duration-[calc(180ms*var(--kf-speed,1))]",
          "motion-reduce:transition-none!",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* Unfold from below: the sheet rises 24px out of a blur, grows from 0.9 and settles on a spring,
   then its sections cascade in. It leaves quickly, sinking a little. */
function DialogContent<Payload = unknown>({
  className,
  ...props
}: React.ComponentProps<typeof DialogContentPart<Payload>>) {
  return (
    <>
      <style href="kf-cascade" precedence="default">
        {cascadeKeyframes}
      </style>
      <DialogContentPart<Payload>
        className={withClass(
          cn(
            "group/dialog transition-[opacity,scale,translate,filter] duration-[calc(420ms*var(--kf-speed,1))] ease-spring",
            "data-starting-style:translate-y-6 data-starting-style:scale-[0.9] data-starting-style:opacity-0 data-starting-style:blur-[8px]",
            "data-ending-style:translate-y-2 data-ending-style:scale-[0.96] data-ending-style:opacity-0 data-ending-style:blur-[4px] data-ending-style:duration-[calc(180ms*var(--kf-speed,1))] data-ending-style:ease-house",
            "data-nested-open:scale-[0.95] data-nested-open:opacity-70",
            cascade,
            "motion-reduce:transition-none!",
          ),
          className,
        )}
        {...props}
      />
    </>
  )
}

export { DialogBackdrop, DialogClose, DialogContent, DialogTrigger }
