"use client"

/* Animated drop-in for `@ui-sdk/react/separator`: same part, same props. Swap the import and keep your
   code. This file adds motion only. Colours, radii, shadows and spacing stay yours. */

import { Separator as SeparatorPart } from "@ui-sdk/react/separator"
import * as React from "react"

import { cn } from "@/lib/utils"

export * from "@ui-sdk/react/separator"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

/* Keyframes rather than transitions: a separator has no earlier state to transition from when it
   first appears, and an animation replays every time it mounts. */
const keyframes =
  "@keyframes kf-separator-x{from{scale:0 1}}@keyframes kf-separator-y{from{scale:1 0}}@keyframes kf-separator-label{from{opacity:0;scale:0.9;filter:blur(4px)}}"

/* Draw: the line grows out from its centre on a spring as it enters; a vertical line draws from
   the top down. Lines next to a `SeparatorLabel` grow outward from the label instead, so an
   "or" divider opens from the word. Several lines in one row follow one another by 40ms. */
function Separator({ className, ...props }: React.ComponentProps<typeof SeparatorPart>) {
  return (
    <>
      <style href="kf-separator" precedence="default">
        {keyframes}
      </style>
      <SeparatorPart
        className={withClass(
          cn(
            "origin-center motion-reduce:animate-none! animate-[kf-separator-x_calc(720ms*var(--kf-speed,1))_var(--ease-spring)_backwards]",
            "data-[orientation=vertical]:origin-top data-[orientation=vertical]:animate-[kf-separator-y_calc(640ms*var(--kf-speed,1))_var(--ease-spring)_backwards]",
            "has-[+[data-slot=separator-label]]:origin-right [[data-slot=separator-label]+&]:origin-left",
            "[animation-delay:calc((min(sibling-index(),10)-1)*calc(40ms*var(--kf-speed,1)))]",
            "motion-reduce:animate-none!",
          ),
          className,
        )}
        {...props}
      />
    </>
  )
}

/* Extra: a word in the middle of a divider ("or"). It clears out of a soft blur once the lines
   beside it are mostly drawn. */
function SeparatorLabel({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="separator-label"
      className={cn(
        "motion-reduce:animate-none! animate-[kf-separator-label_calc(420ms*var(--kf-speed,1))_var(--ease-house)_calc(320ms*var(--kf-speed,1))_backwards]",
        "motion-reduce:animate-none!",
        className,
      )}
      {...props}
    />
  )
}

export { Separator, SeparatorLabel }
