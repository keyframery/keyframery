"use client"

/* Styled separator: the animated primitive plus the Keyframery look. */

import * as React from "react"

import {
  Separator as SeparatorPrimitive,
  SeparatorLabel as SeparatorLabelPrimitive,
} from "@/components/primitives/separator"
import { Speed, type SpeedProps } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

/* A hairline in the border colour: full width when horizontal, the row's height when vertical. */
function Separator({ speed, className, ...props }: React.ComponentProps<typeof SeparatorPrimitive> & SpeedProps) {
  return (
    <Speed speed={speed}>
      <SeparatorPrimitive
        className={cn(
          "shrink-0 bg-border",
          "data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full",
          "data-[orientation=vertical]:w-px data-[orientation=vertical]:self-stretch",
          "[[data-slot=separator-label]+&]:flex-1 has-[+[data-slot=separator-label]]:flex-1",
          className as string,
        )}
        {...props}
      />
    </Speed>
  )
}

/* The word between two lines, as a hint. */
function SeparatorLabel({ className, ...props }: React.ComponentProps<typeof SeparatorLabelPrimitive>) {
  return (
    <SeparatorLabelPrimitive
      className={cn("shrink-0 px-3 text-[12px] leading-none text-muted-foreground", className)}
      {...props}
    />
  )
}

export { Separator, SeparatorLabel }
