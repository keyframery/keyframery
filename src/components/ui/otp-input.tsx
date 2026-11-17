"use client"

export * from "@/components/primitives/otp-input"

/* Theming (inherited; each default preserves the original light/dark appearance):
   --otp-input-surface: Resting slots (default: --muted)
   --otp-input-active: Active slot (default: --background)
   --otp-input-ink: Digits (default: --foreground)
   --otp-input-focus: Gliding focus ring (default: --ring)
   --otp-input-invalid: Invalid ring and tint (default: --destructive)
   --otp-input-width: Slot width (default: 2.5rem)
   --otp-input-height: Slot height (default: 2.75rem)
   --otp-input-radius: Slot and focus corners (default: 10px)
*/

/* Styled OTP input: the animated primitive plus the Keyframery look. */

import * as React from "react"

import {
  OTPInput as OTPInputPrimitive,
  OTPInputGroup as OTPInputGroupPart,
  OTPInputSeparator as OTPInputSeparatorPart,
  OTPInputSlot as OTPInputSlotPrimitive,
  createOTPInputController,
} from "@/components/primitives/otp-input"
import { Speed, type SpeedProps } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

/* One invisible native input spans the root and takes every key, paste and autofill.
   The slots only draw it. The focus ring is the primitive's gliding ring, given the
   field's ring look here; it turns destructive while the code is invalid. */
function OTPInput({ speed, className, ...props }: React.ComponentProps<typeof OTPInputPrimitive> & SpeedProps) {
  return (
    <Speed speed={speed}>
      <OTPInputPrimitive
        className={withClass(
          cn(
            "group/otp flex w-fit items-center gap-2",
            "before:rounded-[var(--otp-input-radius,10px)] before:shadow-[0_0_0_1px_var(--otp-input-focus,var(--ring)),0_0_0_4px_color-mix(in_oklch,var(--otp-input-focus,var(--ring))_25%,transparent)]",
            "has-aria-invalid:before:shadow-[0_0_0_1px_var(--otp-input-invalid,var(--destructive)),0_0_0_4px_color-mix(in_oklch,var(--otp-input-invalid,var(--destructive))_20%,transparent)]",
            "data-disabled:cursor-not-allowed data-disabled:opacity-50",
          ),
          className,
        )}
        {...props}
      />
    </Speed>
  )
}

function OTPInputGroup({ className, ...props }: React.ComponentProps<typeof OTPInputGroupPart>) {
  return <OTPInputGroupPart className={withClass("flex items-center gap-1.5", className)} {...props} />
}

/* Each slot is a small well; the active one brightens under the gliding ring, and an empty
   active slot shows a soft neutral caret. */
function OTPInputSlot({ className, ...props }: React.ComponentProps<typeof OTPInputSlotPrimitive>) {
  return (
    <OTPInputSlotPrimitive
      className={withClass(
        cn(
          "relative grid h-[var(--otp-input-height,2.75rem)] w-[var(--otp-input-width,2.5rem)] place-items-center rounded-[var(--otp-input-radius,10px)] bg-[var(--otp-input-surface,var(--muted))] text-[17px] leading-none font-semibold text-[color:var(--otp-input-ink,var(--foreground))] tabular-nums",
          "[--well-line:rgb(0_0_0/0.035)] dark:[--well-line:rgb(255_255_255/0.04)]",
          "shadow-[inset_0_1px_2px_rgb(0_0_0/0.07),inset_0_0_0_1px_var(--well-line)] dark:shadow-[inset_0_1px_2px_rgb(0_0_0/0.5),inset_0_0_0_1px_var(--well-line)]",
          "transition-[box-shadow,background-color] duration-[calc(150ms*var(--kf-speed,1))] ease-house motion-reduce:transition-none!",
          "group-hover/otp:[--well-line:rgb(0_0_0/0.09)] dark:group-hover/otp:[--well-line:rgb(255_255_255/0.09)]",
          "group-has-aria-invalid/otp:bg-[color-mix(in_oklab,var(--otp-input-invalid,var(--destructive))_6%,transparent)] group-has-aria-invalid/otp:[--well-line:var(--otp-input-invalid,var(--destructive))] dark:group-has-aria-invalid/otp:[--well-line:var(--otp-input-invalid,var(--destructive))]",
          "data-active:bg-[var(--otp-input-active,var(--background))] dark:data-active:bg-[var(--otp-input-active,var(--background))]",
          "data-disabled:bg-[var(--otp-input-surface,var(--muted))]",
          "after:pointer-events-none after:absolute after:top-1/2 after:left-1/2 after:h-[18px] after:w-[1.5px] after:-translate-1/2 after:rounded-full after:bg-foreground/45 after:opacity-0",
          "data-fake-caret:after:animate-pulse data-fake-caret:after:opacity-100 data-fake-caret:after:[animation-duration:1.2s] motion-reduce:after:animate-none!",
        ),
        className,
      )}
      {...props}
    />
  )
}

function OTPInputSeparator({
  className,
  children,
  ...props
}: React.ComponentProps<typeof OTPInputSeparatorPart>) {
  return (
    <OTPInputSeparatorPart
      className={withClass("grid place-items-center text-muted-foreground/60 [&_svg]:size-3.5", className)}
      {...props}
    >
      {children ?? (
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M5 8h6" />
        </svg>
      )}
    </OTPInputSeparatorPart>
  )
}

export { OTPInput, OTPInputGroup, OTPInputSeparator, OTPInputSlot, createOTPInputController }
