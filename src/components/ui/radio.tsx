"use client"

/* Styled radio: the animated primitive plus the Keyframery look. */

import * as React from "react"

import {
  Radio as RadioPrimitive,
  RadioGroup as RadioGroupPrimitive,
  RadioIndicator as RadioIndicatorPrimitive,
} from "@/components/primitives/radio"
import { Speed, type SpeedProps } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

/* The gliding selection ring: a thin primary ring 4px outside the checked radio. */
function RadioGroup({ speed, className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive> & SpeedProps) {
  return (
    <Speed speed={speed}>
      <RadioGroupPrimitive
        className={cn(
          "flex flex-col gap-2.5 outline-none [--kf-radio-pad:4px]",
          "before:bg-transparent before:shadow-[inset_0_0_0_1.5px_color-mix(in_oklab,var(--primary)_28%,transparent)]",
          className as string,
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
        className={cn(
          "relative inline-grid size-[18px] shrink-0 cursor-pointer place-items-center rounded-full outline-none select-none",
          /* A small round field; the primary key is the indicator, which pops in on top. */
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
      className={cn(
        "pointer-events-none absolute inset-0 grid place-items-center rounded-full",
        "bg-primary shadow-[inset_0_1px_0_rgb(255_255_255/0.14),0_1px_2px_rgb(0_0_0/0.25)]",
        "dark:shadow-[inset_0_1px_0_rgb(255_255_255/0.7),0_1px_2px_rgb(0_0_0/0.5)]",
        "after:size-[7px] after:rounded-full after:bg-primary-foreground after:content-['']",
        className as string,
      )}
      {...props}
    />
  )
}

export { Radio, RadioGroup, RadioIndicator }
