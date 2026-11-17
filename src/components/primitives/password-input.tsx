"use client"

/* Animated drop-in for `@ui-sdk/react/password-input`: same parts, same props. Swap the import and keep
   your code. This file adds motion only. Colours, radii, shadows and spacing stay yours. */

import {
  PasswordInput as PasswordInputRoot,
  PasswordInputControl as PasswordInputControlPart,
  PasswordInputToggle as PasswordInputTogglePart,
} from "@ui-sdk/react/password-input"
import * as React from "react"

import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

export * from "@ui-sdk/react/password-input"

const keyframes =
  "@keyframes kf-password-reveal{from{filter:blur(5px);opacity:.35;letter-spacing:.12em}to{filter:none;opacity:1;letter-spacing:normal}}"

/* The root is usually the field's box: its focus ring is the outline, which closes in from
   10px out on a spring, easing from its resting colour to its focus colour. Give it width and colour with `has-[input:focus-visible]:outline-…`. */
function PasswordInput({ className, ...props }: React.ComponentProps<typeof PasswordInputRoot>) {
  return (
    <PasswordInputRoot
      className={withClass(
        cn(
          "outline-offset-[10px] has-[input:focus-visible]:outline-offset-0",
          "[transition:outline-offset_calc(160ms*var(--kf-speed,1))_var(--ease-house),outline-width_calc(160ms*var(--kf-speed,1))_var(--ease-house),outline-color_0s_linear_calc(160ms*var(--kf-speed,1)),box-shadow_calc(150ms*var(--kf-speed,1))_var(--ease-house),background-color_calc(150ms*var(--kf-speed,1))_var(--ease-house)] has-[input:focus-visible]:[transition:outline-offset_calc(900ms*var(--kf-speed,1))_var(--ease-spring),outline-width_calc(900ms*var(--kf-speed,1))_var(--ease-spring),outline-color_calc(700ms*var(--kf-speed,1))_var(--ease-house),box-shadow_calc(150ms*var(--kf-speed,1))_var(--ease-house),background-color_calc(150ms*var(--kf-speed,1))_var(--ease-house)]",
          "motion-reduce:[transition:none]!",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* When the password is revealed, the text comes into focus: a short blur-to-clear. */
function PasswordInputControl({
  className,
  ...props
}: React.ComponentProps<typeof PasswordInputControlPart>) {
  return (
    <>
      <style href="kf-password-reveal" precedence="default">
        {keyframes}
      </style>
      <PasswordInputControlPart
        className={withClass("data-visible:animate-[kf-password-reveal_calc(420ms*var(--kf-speed,1))_var(--ease-house)] motion-reduce:animate-none!", className)}
        {...props}
      />
    </>
  )
}

/* The toggle presses with a pop release. Whatever icon it shows pops in when it changes
   (render a different icon for each state, as the UI SDK examples do): it grows from 40%
   with a quarter turn on `ease-pop`. */
function PasswordInputToggle({
  className,
  ...props
}: React.ComponentProps<typeof PasswordInputTogglePart>) {
  return (
    <PasswordInputTogglePart
      className={withClass(
        cn(
          "[transition:scale_calc(260ms*var(--kf-speed,1))_var(--ease-pop),color_calc(150ms*var(--kf-speed,1)),background-color_calc(150ms*var(--kf-speed,1))] active:scale-[0.86]",
          "[&_svg]:[transition:scale_calc(440ms*var(--kf-speed,1))_var(--ease-pop),rotate_calc(440ms*var(--kf-speed,1))_var(--ease-pop),opacity_calc(200ms*var(--kf-speed,1))_var(--ease-house)]",
          "[&_svg]:starting:scale-[0.4] [&_svg]:starting:-rotate-90 [&_svg]:starting:opacity-0",
          "motion-reduce:[transition:none]! motion-reduce:[&_svg]:[transition:none]",
        ),
        className,
      )}
      {...props}
    />
  )
}

export { PasswordInput, PasswordInputControl, PasswordInputToggle }
