"use client"

export * from "@/components/primitives/separator"

/* Styled separator: the animated primitive plus the Keyframery look. */

/* Theming: inherit these optional variables; unset values retain the original light/dark tokens.
   --separator-line: Divider colour (default: --border).
   --separator-ink: Divider label (default: --muted-foreground).
   --separator-thickness: Line thickness (default: 1px).
   --separator-label-gap: Space either side of a label (default: 0.75rem).
   --separator-font: Label size (default: 12px).
 */

import * as React from "react"

import {
  Separator as SeparatorPrimitive,
  SeparatorLabel as SeparatorLabelPrimitive,
} from "@/components/primitives/separator"
import { Speed, type SpeedProps } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

/* A hairline in the border colour: full width when horizontal, the row's height when vertical.
   The vertical stretch is a plain class, not a `data-[orientation=vertical]:` one, so a `self-*`
   class passed in replaces it: `className="h-4 self-center"` gives a short line centred in its
   row, where a stretch that outranked it would pin the line to the top of the row. */
function Separator({ speed, className, ...props }: React.ComponentProps<typeof SeparatorPrimitive> & SpeedProps) {
  return (
    <Speed speed={speed}>
      <SeparatorPrimitive
        className={withClass(
          cn(
            "shrink-0 bg-[var(--separator-line,var(--border))]",
            "data-[orientation=horizontal]:h-[var(--separator-thickness,1px)] data-[orientation=horizontal]:w-full",
            "data-[orientation=vertical]:w-[var(--separator-thickness,1px)]",
            props.orientation === "vertical" && "self-stretch",
            "[[data-slot=separator-label]+&]:flex-1 has-[+[data-slot=separator-label]]:flex-1",
          ),
          className,
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
      className={cn("shrink-0 px-[var(--separator-label-gap,0.75rem)] text-[length:var(--separator-font,12px)] leading-none text-[color:var(--separator-ink,var(--muted-foreground))]", className)}
      {...props}
    />
  )
}

export { Separator, SeparatorLabel }
