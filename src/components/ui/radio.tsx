"use client"

export * from "@/components/primitives/radio"

/* Theming (inherited; each default preserves the original light/dark appearance):
   --radio-surface: Unchecked radio (default: --background, --accent at 40% in dark)
   --radio-selected: Checked disc (default: --primary)
   --radio-dot: Checked dot (default: --primary-foreground)
   --radio-ring: Gliding ring, mixed to 28% (default: --primary)
   --radio-size: Radio width and height (default: 18px)
   --radio-dot-size: Dot diameter (default: 7px)
   --radio-gap: Option gap (default: 0.625rem)
   --radio-radius: Disc corners (default: 9999px)
*/

/* Styled radio: the animated primitive plus the Keyframery look. */

import * as React from "react"

import {
  Radio as RadioPrimitive,
  RadioGroup as RadioGroupPrimitive,
  RadioIndicator as RadioIndicatorPrimitive,
} from "@/components/primitives/radio"
import { Speed, type SpeedProps } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

/* The gliding selection ring: a thin primary ring 4px outside the checked radio. */
function RadioGroup({ speed, className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive> & SpeedProps) {
  return (
    <Speed speed={speed}>
      <RadioGroupPrimitive
        className={withClass(
          cn(
            "flex flex-col gap-[var(--radio-gap,0.625rem)] outline-none [--kf-radio-pad:4px]",
            "before:bg-transparent before:shadow-[inset_0_0_0_1.5px_color-mix(in_oklab,var(--radio-ring,var(--primary))_28%,transparent)]",
          ),
          className,
        )}
        {...props}
      />
    </Speed>
  )
}

function Radio({
  speed,
  className,
  children,
  ...props
}: React.ComponentProps<typeof RadioPrimitive> & SpeedProps) {
  return (
    <Speed speed={speed}>
      <RadioPrimitive
        className={withClass(
          cn(
            "relative inline-grid size-[var(--radio-size,18px)] shrink-0 cursor-pointer place-items-center rounded-[var(--radio-radius,9999px)] outline-none select-none",
            /* A small round field; the primary key is the indicator, which pops in on top. */
            "bg-[var(--radio-surface,var(--background))] shadow-[0_0_0_1px_rgb(0_0_0/0.14),0_1px_2px_rgb(0_0_0/0.05)]",
            "dark:bg-[var(--radio-surface,color-mix(in_oklab,var(--accent)_40%,transparent))] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.14)]",
            "not-data-disabled:not-data-readonly:hover:shadow-[0_0_0_1px_rgb(0_0_0/0.24),0_1px_2px_rgb(0_0_0/0.06)]",
            "dark:not-data-disabled:not-data-readonly:hover:shadow-[0_0_0_1px_rgb(255_255_255/0.24)]",
            "transition-[box-shadow,scale] motion-reduce:transition-none!",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "data-disabled:cursor-not-allowed data-disabled:opacity-50 data-readonly:cursor-default",
          ),
          className,
        )}
        {...props}
      >
        {children ?? <RadioIndicator />}
      </RadioPrimitive>
    </Speed>
  )
}

/* A primary disc holding a dot. */
function RadioIndicator({ className, ...props }: React.ComponentProps<typeof RadioIndicatorPrimitive>) {
  return (
    <RadioIndicatorPrimitive
      aria-hidden
      className={withClass(
        cn(
          "pointer-events-none absolute inset-0 grid place-items-center rounded-[var(--radio-radius,9999px)]",
          "bg-[var(--radio-selected,var(--primary))] shadow-[inset_0_1px_0_rgb(255_255_255/0.14),0_1px_2px_rgb(0_0_0/0.25)]",
          "dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.7),0_1px_2px_rgb(0_0_0/0.5)]",
          "after:size-[var(--radio-dot-size,7px)] after:rounded-[var(--radio-radius,9999px)] after:bg-[var(--radio-dot,var(--primary-foreground))] after:content-['']",
        ),
        className,
      )}
      {...props}
    />
  )
}

export { Radio, RadioGroup, RadioIndicator }

/* UI SDK's helpers for this component, passed through. */
export { createRadioGroupController } from "@/components/primitives/radio"
