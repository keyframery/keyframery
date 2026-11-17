"use client"

export * from "@/components/primitives/label"

/* Theming (inherited; each default preserves the original light/dark appearance):
   --label-ink: Resting label text (default: --muted-foreground)
   --label-focus: Focused label and marker text (default: --foreground)
   --label-invalid: Invalid label and marker text (default: --destructive)
   --label-marker: Marker surface (default: --muted)
   --label-marker-ink: Resting marker text (default: --muted-foreground)
   --label-font: Label text size (default: 13px)
   --label-gap: Label to marker gap (default: 0.375rem)
   --label-marker-radius: Marker corners (default: 9999px)
*/

/* Styled label: the animated primitive plus the Keyframery look. */

import * as React from "react"

import { Label as LabelPrimitive, LabelMarker as LabelMarkerPrimitive } from "@/components/primitives/label"
import { Speed, type SpeedProps } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

/* Quiet at rest, full ink while its control has focus, destructive while the control is invalid. */
function Label({ speed, className, ...props }: React.ComponentProps<typeof LabelPrimitive> & SpeedProps) {
  return (
    <Speed speed={speed}>
      <LabelPrimitive
        className={withClass(
          cn(
            "inline-flex items-center gap-[var(--label-gap,0.375rem)] text-[length:var(--label-font,13px)] leading-none font-medium text-[color:var(--label-ink,var(--muted-foreground))] select-none",
            "data-focused:text-[color:var(--label-focus,var(--foreground))] data-invalid:text-[color:var(--label-invalid,var(--destructive))]",
            "has-[[data-disabled]]:opacity-50",
          ),
          className,
        )}
        {...props}
      />
    </Speed>
  )
}

/* A small pill for "Required" or "Optional" that pops when the control is focused or invalid. */
function LabelMarker({ className, ...props }: React.ComponentProps<typeof LabelMarkerPrimitive>) {
  return (
    <LabelMarkerPrimitive
      className={cn(
        "rounded-[var(--label-marker-radius,9999px)] bg-[var(--label-marker,var(--muted))] px-1.5 py-[3px] text-[10.5px] leading-none font-medium text-[color:var(--label-marker-ink,var(--muted-foreground))]",
        /* The pop stays on scale, opacity and lift; the colours shift on the house ease. */
        "[transition:scale_calc(420ms*var(--kf-speed,1))_var(--ease-pop),opacity_calc(420ms*var(--kf-speed,1))_var(--ease-pop),translate_calc(420ms*var(--kf-speed,1))_var(--ease-pop),color_calc(180ms*var(--kf-speed,1))_var(--ease-house),background-color_calc(180ms*var(--kf-speed,1))_var(--ease-house)]",
        "motion-reduce:[transition:none]!",
        "group-data-focused/kf-label:bg-[color-mix(in_oklab,var(--label-marker,var(--foreground))_7%,transparent)] group-data-focused/kf-label:text-[color:var(--label-focus,var(--foreground))]",
        "group-data-invalid/kf-label:bg-[color-mix(in_oklab,var(--label-invalid,var(--destructive))_10%,transparent)] group-data-invalid/kf-label:text-[color:var(--label-invalid,var(--destructive))]",
        className,
      )}
      {...props}
    />
  )
}

export { Label, LabelMarker }
