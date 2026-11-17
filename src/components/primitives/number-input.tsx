"use client"

/* Animated drop-in for `@ui-sdk/react/number-input`: same parts, same props. Swap the import and keep
   your code. This file adds motion only. Colours, radii, shadows and spacing stay yours. */

import {
  NumberInputControl as NumberInputControlPart,
  NumberInputDecrement as NumberInputDecrementPart,
  NumberInputGroup as NumberInputGroupPart,
  NumberInputIncrement as NumberInputIncrementPart,
} from "@ui-sdk/react/number-input"
import * as React from "react"

import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

export * from "@ui-sdk/react/number-input"

/* The group is usually the field's box: its focus ring is the outline, which closes in from
   10px out on a spring, easing from its resting colour to its focus colour. Give it width and colour with `has-[input:focus-visible]:outline-…`. */
function NumberInputGroup({ className, ...props }: React.ComponentProps<typeof NumberInputGroupPart>) {
  return (
    <NumberInputGroupPart
      className={withClass(
        cn(
          "outline-offset-[10px] has-[input:focus-visible]:outline-offset-0 data-scrubbing:outline-offset-0",
          "[transition:outline-offset_calc(160ms*var(--kf-speed,1))_var(--ease-house),outline-width_calc(160ms*var(--kf-speed,1))_var(--ease-house),outline-color_0s_linear_calc(160ms*var(--kf-speed,1)),box-shadow_calc(150ms*var(--kf-speed,1))_var(--ease-house),background-color_calc(150ms*var(--kf-speed,1))_var(--ease-house)] has-[input:focus-visible]:[transition:outline-offset_calc(900ms*var(--kf-speed,1))_var(--ease-spring),outline-width_calc(900ms*var(--kf-speed,1))_var(--ease-spring),outline-color_calc(700ms*var(--kf-speed,1))_var(--ease-house),box-shadow_calc(150ms*var(--kf-speed,1))_var(--ease-house),background-color_calc(150ms*var(--kf-speed,1))_var(--ease-house)] data-scrubbing:[transition:outline-offset_calc(900ms*var(--kf-speed,1))_var(--ease-spring),outline-width_calc(900ms*var(--kf-speed,1))_var(--ease-spring),outline-color_calc(700ms*var(--kf-speed,1))_var(--ease-house),box-shadow_calc(150ms*var(--kf-speed,1))_var(--ease-house),background-color_calc(150ms*var(--kf-speed,1))_var(--ease-house)]",
          "motion-reduce:[transition:none]!",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* While a stepper is held, the value leans 3px toward it, and springs back on release. */
function NumberInputControl({
  className,
  ...props
}: React.ComponentProps<typeof NumberInputControlPart>) {
  return (
    <NumberInputControlPart
      className={withClass(
        cn(
          "transition-[translate] duration-[calc(300ms*var(--kf-speed,1))] ease-pop motion-reduce:transition-none!",
          "in-[[data-slot=number-input-group]:has([data-slot=number-input-increment]:not([data-disabled]):active)]:translate-x-[3px]",
          "in-[[data-slot=number-input-group]:has([data-slot=number-input-decrement]:not([data-disabled]):active)]:-translate-x-[3px]",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* Steppers press deep and spring back with a pop. */
const stepperMotion =
  "[transition:scale_calc(280ms*var(--kf-speed,1))_var(--ease-pop),translate_calc(280ms*var(--kf-speed,1))_var(--ease-pop),box-shadow_calc(120ms*var(--kf-speed,1))_var(--ease-house),background-color_calc(120ms*var(--kf-speed,1))_var(--ease-house),color_calc(120ms*var(--kf-speed,1))_var(--ease-house),opacity_calc(120ms*var(--kf-speed,1))_var(--ease-house)] " +
  "active:scale-[0.84] data-disabled:active:scale-100 motion-reduce:[transition:none]!"

function NumberInputDecrement({
  className,
  ...props
}: React.ComponentProps<typeof NumberInputDecrementPart>) {
  return <NumberInputDecrementPart className={withClass(stepperMotion, className)} {...props} />
}

function NumberInputIncrement({
  className,
  ...props
}: React.ComponentProps<typeof NumberInputIncrementPart>) {
  return <NumberInputIncrementPart className={withClass(stepperMotion, className)} {...props} />
}

export { NumberInputControl, NumberInputDecrement, NumberInputGroup, NumberInputIncrement }
