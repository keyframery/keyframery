"use client"

/* Styled checkbox: the animated primitive plus the Keyframery look. */

import * as React from "react"

import {
  Checkbox as CheckboxPrimitive,
  CheckboxGroup as CheckboxGroupPrimitive,
  CheckboxIndicator as CheckboxIndicatorPrimitive,
} from "@/components/primitives/checkbox"
import { Speed, type SpeedProps } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

function Checkbox({
  speed,
  className,
  children,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive> & SpeedProps) {
  return (
    <Speed speed={speed}>
      <CheckboxPrimitive
        className={cn(
          "relative inline-grid size-[18px] shrink-0 cursor-pointer place-items-center rounded-[5px] outline-none select-none",
          /* Unchecked: a small field. The primary key is the indicator, which pops in on top. */
          "bg-background shadow-[0_0_0_1px_rgb(0_0_0/0.14),0_1px_2px_rgb(0_0_0/0.05)]",
          "dark:bg-accent/40 dark:shadow-[0_0_0_1px_rgb(255_255_255/0.14)]",
          "not-data-disabled:not-data-readonly:hover:shadow-[0_0_0_1px_rgb(0_0_0/0.24),0_1px_2px_rgb(0_0_0/0.06)]",
          "dark:not-data-disabled:not-data-readonly:hover:shadow-[0_0_0_1px_rgb(255_255_255/0.24)]",
          "transition-[box-shadow,scale] motion-reduce:transition-none!",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "data-disabled:cursor-not-allowed data-disabled:opacity-50 data-readonly:cursor-default",
          className as string,
        )}
        {...props}
      >
        {children ?? <CheckboxIndicator />}
      </CheckboxPrimitive>
    </Speed>
  )
}

/* The primary key with a check, or a dash while mixed. A new mark mounts each time the state
   changes, so going from mixed to checked draws the check too. */
function CheckboxIndicator({
  className,
  children,
  ...props
}: React.ComponentProps<typeof CheckboxIndicatorPrimitive>) {
  return (
    <CheckboxIndicatorPrimitive
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 grid place-items-center rounded-[inherit] [--kf-dash:1] [&_svg]:size-3",
        "bg-primary text-primary-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.14),0_1px_2px_rgb(0_0_0/0.25)]",
        "dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.7),0_1px_2px_rgb(0_0_0/0.5)]",
        "[[data-slot=checkbox]:not([data-disabled]):not([data-readonly]):hover>&]:bg-[color-mix(in_oklab,var(--primary),var(--background)_10%)]",
        className as string,
      )}
      {...props}
    >
      {children ??
        ((state: { indeterminate: boolean }) => (
          <svg
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {state.indeterminate ? (
              <path key="dash" d="M3 6h6" pathLength={1} />
            ) : (
              <path key="check" d="M2.75 6.25 5 8.5l4.25-5" pathLength={1} />
            )}
          </svg>
        ))}
    </CheckboxIndicatorPrimitive>
  )
}

function CheckboxGroup({
  speed,
  className,
  ...props
}: React.ComponentProps<typeof CheckboxGroupPrimitive> & SpeedProps) {
  return (
    <Speed speed={speed}>
      <CheckboxGroupPrimitive className={cn("flex flex-col gap-2.5", className as string)} {...props} />
    </Speed>
  )
}

export { Checkbox, CheckboxGroup, CheckboxIndicator }

/* UI SDK's helpers for this component, passed through. */
export { createCheckboxController, createCheckboxGroupController } from "@/components/primitives/checkbox"
