"use client"

/* Animated button group, on UI SDK's core. UI SDK ships no button group, so the behaviour is defined
   in `@/components/core/button-group` with `definePrimitive` and rendered here. Put Keyframery's (or
   UI SDK's) Button straight inside it. This file adds motion only. Colours, radii, shadows and
   spacing stay yours.

   - Glide: one highlight springs from segment to segment under the pointer or keyboard focus, and
     takes each segment's corners as it goes. It is the group's `::after`, laid over the buttons so it
     shows on solid keys; it follows the text colour unless you give it one with `after:` classes.
   - It fades in where it lands the first time, and fades out where it was when the pointer leaves.
   - `ButtonGroupSeparator` is UI SDK's Separator; the line draws in from its centre. */

import { createParts } from "@ui-sdk/react/primitive"
import { Separator as SeparatorPart } from "@ui-sdk/react/separator"
import * as React from "react"

import { buttonGroup } from "@/components/core/button-group"
import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

const { Root: ButtonGroupRoot, Text: ButtonGroupTextPart } = createParts(buttonGroup, { root: "div", text: "div" })

function ButtonGroup({ className, ...props }: React.ComponentProps<typeof ButtonGroupRoot>) {
  return (
    <ButtonGroupRoot
      className={withClass(
        cn(
          "relative isolate",
          "after:pointer-events-none after:absolute after:z-20 after:content-['']",
          "after:top-(--highlight-top,0) after:left-(--highlight-left,0) after:h-(--highlight-height,0) after:w-(--highlight-width,0) after:rounded-(--highlight-radius,0)",
          "after:bg-[color-mix(in_oklch,currentColor_9%,transparent)] after:opacity-0 after:scale-[0.94]",
          "after:[transition:opacity_calc(160ms*var(--kf-speed,1))_var(--ease-house),scale_calc(220ms*var(--kf-speed,1))_var(--ease-house)]",
          "data-highlighted:after:opacity-100 data-highlighted:after:scale-100",
          "data-gliding:after:[transition:left_calc(380ms*var(--kf-speed,1))_var(--ease-spring),top_calc(380ms*var(--kf-speed,1))_var(--ease-spring),width_calc(380ms*var(--kf-speed,1))_var(--ease-spring),height_calc(380ms*var(--kf-speed,1))_var(--ease-spring),border-radius_calc(380ms*var(--kf-speed,1))_var(--ease-spring),opacity_calc(160ms*var(--kf-speed,1))_var(--ease-house),scale_calc(220ms*var(--kf-speed,1))_var(--ease-house)]",
          "motion-reduce:after:[transition:opacity_calc(160ms*var(--kf-speed,1))_var(--ease-house)]! motion-reduce:after:scale-100",
        ),
        className,
      )}
      {...props}
    />
  )
}

function ButtonGroupText({ className, ...props }: React.ComponentProps<typeof ButtonGroupTextPart>) {
  return <ButtonGroupTextPart className={withClass("relative", className)} {...props} />
}

const separatorKeyframes = "@keyframes kf-button-group-sep-y{from{scale:1 0}}@keyframes kf-button-group-sep-x{from{scale:0 1}}"

/* A line between segments. It runs across the group, so it is vertical in a row and horizontal in a column. */
function ButtonGroupSeparator({
  className,
  orientation = "vertical",
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPart>) {
  return (
    <>
      <style href="kf-button-group-sep" precedence="default">
        {separatorKeyframes}
      </style>
      <SeparatorPart
        orientation={orientation}
        decorative={decorative}
        className={withClass(
          cn(
            "relative z-10 shrink-0 self-stretch",
            "data-[orientation=vertical]:animate-[kf-button-group-sep-y_calc(420ms*var(--kf-speed,1))_var(--ease-spring)_both]",
            "data-[orientation=horizontal]:animate-[kf-button-group-sep-x_calc(420ms*var(--kf-speed,1))_var(--ease-spring)_both]",
            "motion-reduce:animate-none!",
          ),
          className,
        )}
        {...props}
      />
    </>
  )
}

export { ButtonGroup, ButtonGroupSeparator, ButtonGroupText }
