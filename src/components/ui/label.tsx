"use client"

/* Styled label: the animated primitive plus the Keyframery look. */

import * as React from "react"

import { Label as LabelPrimitive, LabelMarker as LabelMarkerPrimitive } from "@/components/primitives/label"
import { cn } from "@/lib/utils"

/* Quiet at rest, full ink while its control has focus, destructive while the control is invalid. */
function Label({ className, ...props }: React.ComponentProps<typeof LabelPrimitive>) {
  return (
    <LabelPrimitive
      className={cn(
        "inline-flex items-center gap-1.5 text-[13px] leading-none font-medium text-muted-foreground select-none",
        "data-focused:text-foreground data-invalid:text-destructive",
        "has-[[data-disabled]]:opacity-50",
        className as string,
      )}
      {...props}
    />
  )
}

/* A small pill for "Required" or "Optional" that pops when the control is focused or invalid. */
function LabelMarker({ className, ...props }: React.ComponentProps<typeof LabelMarkerPrimitive>) {
  return (
    <LabelMarkerPrimitive
      className={cn(
        "rounded-full bg-muted px-1.5 py-[3px] text-[10.5px] leading-none font-medium text-muted-foreground",
        /* The pop stays on scale, opacity and lift; the colours shift on the house ease. */
        "[transition:scale_calc(420ms*var(--kf-speed,1))_var(--ease-pop),opacity_calc(420ms*var(--kf-speed,1))_var(--ease-pop),translate_calc(420ms*var(--kf-speed,1))_var(--ease-pop),color_calc(180ms*var(--kf-speed,1))_var(--ease-house),background-color_calc(180ms*var(--kf-speed,1))_var(--ease-house)]",
        "motion-reduce:[transition:none]!",
        "group-data-focused/kf-label:bg-foreground/[0.07] group-data-focused/kf-label:text-foreground",
        "group-data-invalid/kf-label:bg-destructive/10 group-data-invalid/kf-label:text-destructive",
        className,
      )}
      {...props}
    />
  )
}

export { Label, LabelMarker }
