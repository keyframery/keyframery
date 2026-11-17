"use client"

export * from "@/components/primitives/meter"

/* Theming (inherited; each default preserves the original light/dark appearance):
   --meter-fill: Normal fill (default: --primary)
   --meter-track: Track surface (default: --muted)
   --meter-ink: Label (default: --foreground)
   --meter-value-ink: Value text (default: --muted-foreground)
   --meter-danger: High reading fill and value (default: --destructive)
   --meter-height: Track height (default: 0.375rem)
   --meter-radius: Track and fill corners (default: 9999px)
   --meter-gap: Label to track gap (default: 0.5rem)
*/

/* Styled meter: the animated primitive plus the Keyframery look. */

import {
  Meter as MeterRoot,
  MeterIndicator as MeterIndicatorPart,
  MeterLabel as MeterLabelPart,
  MeterTrack as MeterTrackPart,
  MeterValue as MeterValuePart,
} from "@/components/primitives/meter"
import * as React from "react"

import { Speed, type SpeedProps } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

/* Label and value share the first row; the track spans the row below.
   `high` works like the native meter's: a reading above it is the bad range,
   and only then does the meter use the destructive colour. */
function Meter({
  speed,
  className,
  high,
  ...props
}: React.ComponentProps<typeof MeterRoot> & { high?: number } & SpeedProps) {
  const over = high !== undefined && props.value > high
  return (
    <Speed speed={speed}>
      <MeterRoot
        data-high={over ? "" : undefined}
        className={withClass("group/meter grid w-full grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-3 gap-y-[var(--meter-gap,0.5rem)]", className)}
        {...props}
      />
    </Speed>
  )
}

function MeterLabel({ className, ...props }: React.ComponentProps<typeof MeterLabelPart>) {
  return (
    <MeterLabelPart
      className={withClass("truncate text-[13px] leading-5 font-medium text-[color:var(--meter-ink,var(--foreground))]", className)}
      {...props}
    />
  )
}

function MeterValue({ className, ...props }: React.ComponentProps<typeof MeterValuePart>) {
  return (
    <MeterValuePart
      className={withClass(
        cn(
          "col-start-2 text-[13px] leading-5 text-[color:var(--meter-value-ink,var(--muted-foreground))] tabular-nums",
          "transition-colors duration-[calc(150ms*var(--kf-speed,1))] group-data-high/meter:text-[color:var(--meter-danger,var(--destructive))] motion-reduce:transition-none!",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* The track is a thin pill well. */
function MeterTrack({ className, ...props }: React.ComponentProps<typeof MeterTrackPart>) {
  return (
    <MeterTrackPart
      className={withClass(
        cn(
          "relative col-span-full h-[var(--meter-height,0.375rem)] w-full rounded-[var(--meter-radius,9999px)] bg-[var(--meter-track,var(--muted))]",
          "shadow-[inset_0_1px_2px_rgb(0_0_0/0.07),inset_0_0_0_1px_rgb(0_0_0/0.035)]",
          "dark:shadow-[inset_0_1px_2px_rgb(0_0_0/0.5),inset_0_0_0_1px_rgb(255_255_255/0.04)]",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* The fill springs to each new reading (from the primitive) and turns destructive only above `high`. */
function MeterIndicator({ className, ...props }: React.ComponentProps<typeof MeterIndicatorPart>) {
  return (
    <MeterIndicatorPart
      className={withClass(
        cn(
          "rounded-[var(--meter-radius,9999px)] bg-[var(--meter-fill,var(--primary))]",
          "shadow-[inset_0_1px_0_rgb(255_255_255/0.14)]",
          "group-data-high/meter:bg-[var(--meter-danger,var(--destructive))]",
        ),
        className,
      )}
      {...props}
    />
  )
}

export { Meter, MeterIndicator, MeterLabel, MeterTrack, MeterValue }
