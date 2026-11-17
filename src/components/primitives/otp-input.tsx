"use client"

/* Animated drop-in for `@ui-sdk/react/otp-input`: same parts, same props. Swap the import and keep
   your code. This file adds motion only. Colours, radii, shadows and spacing stay yours. */

import { OTPInput as OTPInputRoot, OTPInputSlot as OTPInputSlotPart } from "@ui-sdk/react/otp-input"
import * as React from "react"

import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

export * from "@ui-sdk/react/otp-input"

const keyframes =
  "@keyframes kf-otp-wave{0%{translate:0 0;scale:1}35%{translate:0 -5px;scale:1.07}100%{translate:0 0;scale:1}}"

/* Glide: one ring, drawn by the root, glides from slot to slot under CSS anchors instead of
   each slot lighting up. Its default look is neutral and follows the text colour; restyle it
   with `before:` classes (radius, shadow). It fades out when the input loses focus. */
function OTPInput({ className, ...props }: React.ComponentProps<typeof OTPInputRoot>) {
  return (
    <>
      <style href="kf-otp-wave" precedence="default">
        {keyframes}
      </style>
      <OTPInputRoot
        className={withClass(
          cn(
            "group/kf-otp isolate [anchor-scope:--kf-otp]",
            "before:pointer-events-none before:absolute before:z-10 before:[position-anchor:--kf-otp]",
            "before:top-[anchor(top)] before:right-[anchor(right)] before:bottom-[anchor(bottom)] before:left-[anchor(left)]",
            "before:rounded-[10px] before:shadow-[0_0_0_2px_color-mix(in_oklch,currentColor_40%,transparent)]",
            "before:scale-75 before:opacity-0 has-data-active:before:scale-100 has-data-active:before:opacity-100",
            "before:[transition:top_calc(340ms*var(--kf-speed,1))_var(--ease-spring),right_calc(340ms*var(--kf-speed,1))_var(--ease-spring),bottom_calc(340ms*var(--kf-speed,1))_var(--ease-spring),left_calc(340ms*var(--kf-speed,1))_var(--ease-spring),scale_calc(360ms*var(--kf-speed,1))_var(--ease-pop),opacity_calc(200ms*var(--kf-speed,1))_var(--ease-house)]",
            "motion-reduce:before:[transition:none]!",
          ),
          className,
        )}
        {...props}
      />
    </>
  )
}

/* Each typed character rises 12px into place from half size on `ease-pop`. When the code is
   complete, the slots pulse once, left to right. */
function OTPInputSlot({
  className,
  children,
  index,
  style,
  ...props
}: React.ComponentProps<typeof OTPInputSlotPart>) {
  const order = { "--kf-i": index } as React.CSSProperties
  return (
    <OTPInputSlotPart
      index={index}
      style={typeof style === "function" ? (state) => ({ ...order, ...style(state) }) : { ...order, ...style }}
      className={withClass(
        cn(
          "data-active:[anchor-name:--kf-otp]",
          "group-data-complete/kf-otp:animate-[kf-otp-wave_calc(560ms*var(--kf-speed,1))_var(--ease-house)_calc(var(--kf-i)*calc(60ms*var(--kf-speed,1)))_both]",
          "motion-reduce:animate-none!",
        ),
        className,
      )}
      {...props}
    >
      {children ??
        ((state) =>
          state.char ? (
            <span
              key={state.char}
              className={cn(
                "inline-block [transition:translate_calc(460ms*var(--kf-speed,1))_var(--ease-pop),scale_calc(460ms*var(--kf-speed,1))_var(--ease-pop),opacity_calc(220ms*var(--kf-speed,1))_var(--ease-house),filter_calc(260ms*var(--kf-speed,1))_var(--ease-house)]",
                "starting:translate-y-3 starting:scale-50 starting:opacity-0 starting:blur-[3px] motion-reduce:[transition:none]!",
              )}
            >
              {state.char}
            </span>
          ) : null)}
    </OTPInputSlotPart>
  )
}

export { OTPInput, OTPInputSlot }
