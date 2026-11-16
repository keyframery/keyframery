"use client"

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

/* One invisible native input spans the root and takes every key, paste and autofill.
   The slots only draw it. The focus ring is the primitive's gliding ring, given the
   field's ring look here; it turns destructive while the code is invalid. */
function OTPInput({ speed, className, ...props }: React.ComponentProps<typeof OTPInputPrimitive> & SpeedProps) {
  return (
    <Speed speed={speed}>
      <OTPInputPrimitive
        className={cn(
          "group/otp flex w-fit items-center gap-2",
          "before:rounded-[10px] before:shadow-[0_0_0_1px_var(--ring),0_0_0_4px_color-mix(in_oklch,var(--ring)_25%,transparent)]",
          "has-aria-invalid:before:shadow-[0_0_0_1px_var(--destructive),0_0_0_4px_color-mix(in_oklch,var(--destructive)_20%,transparent)]",
          "data-disabled:cursor-not-allowed data-disabled:opacity-50",
          className,
        )}
        {...props}
      />
    </Speed>
  )
}

function OTPInputGroup({ className, ...props }: React.ComponentProps<typeof OTPInputGroupPart>) {
  return <OTPInputGroupPart className={cn("flex items-center gap-1.5", className)} {...props} />
}

/* Each slot is a small well; the active one brightens under the gliding ring, and an empty
   active slot shows a soft neutral caret. */
function OTPInputSlot({ className, ...props }: React.ComponentProps<typeof OTPInputSlotPrimitive>) {
  return (
    <OTPInputSlotPrimitive
      className={cn(
        "relative grid h-11 w-10 place-items-center rounded-[10px] bg-muted text-[17px] leading-none font-semibold text-foreground tabular-nums",
        "[--well-line:rgb(0_0_0/0.035)] dark:[--well-line:rgb(255_255_255/0.04)]",
        "shadow-[inset_0_1px_2px_rgb(0_0_0/0.07),inset_0_0_0_1px_var(--well-line)] dark:shadow-[inset_0_1px_2px_rgb(0_0_0/0.5),inset_0_0_0_1px_var(--well-line)]",
        "transition-[box-shadow,background-color] duration-[calc(150ms*var(--kf-speed,1))] ease-house motion-reduce:transition-none!",
        "group-hover/otp:[--well-line:rgb(0_0_0/0.09)] dark:group-hover/otp:[--well-line:rgb(255_255_255/0.09)]",
        "group-has-aria-invalid/otp:bg-destructive/[0.06] group-has-aria-invalid/otp:[--well-line:var(--destructive)] dark:group-has-aria-invalid/otp:[--well-line:var(--destructive)]",
        "data-active:bg-background dark:data-active:bg-background",
        "data-disabled:bg-muted",
        "after:pointer-events-none after:absolute after:top-1/2 after:left-1/2 after:h-[18px] after:w-[1.5px] after:-translate-1/2 after:rounded-full after:bg-foreground/45 after:opacity-0",
        "data-fake-caret:after:animate-pulse data-fake-caret:after:opacity-100 data-fake-caret:after:[animation-duration:1.2s] motion-reduce:after:animate-none!",
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
      className={cn("grid place-items-center text-muted-foreground/60 [&_svg]:size-3.5", className)}
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
