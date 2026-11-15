"use client"

/* Styled meter: the animated primitive plus the Keyframery look. */

import {
  Meter as MeterRoot,
  MeterIndicator as MeterIndicatorPart,
  MeterLabel as MeterLabelPart,
  MeterTrack as MeterTrackPart,
  MeterValue as MeterValuePart,
} from "@/components/primitives/meter"
import * as React from "react"

import { cn } from "@/lib/utils"

/* Label and value share the first row; the track spans the row below.
   `high` works like the native meter's: a reading above it is the bad range,
   and only then does the meter use the destructive colour. */
function Meter({
  className,
  high,
  ...props
}: React.ComponentProps<typeof MeterRoot> & { high?: number }) {
  const over = high !== undefined && props.value > high
  return (
    <MeterRoot
      data-high={over ? "" : undefined}
      className={cn(
        "group/meter grid w-full grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-3 gap-y-2",
        className,
      )}
      {...props}
    />
  )
}

function MeterLabel({ className, ...props }: React.ComponentProps<typeof MeterLabelPart>) {
  return (
    <MeterLabelPart
      className={cn("truncate text-[13px] leading-5 font-medium text-foreground", className)}
      {...props}
    />
  )
}

function MeterValue({ className, ...props }: React.ComponentProps<typeof MeterValuePart>) {
  return (
    <MeterValuePart
      className={cn(
        "col-start-2 text-[13px] leading-5 text-muted-foreground tabular-nums",
        "transition-colors duration-[calc(150ms*var(--kf-speed,1))] group-data-high/meter:text-destructive motion-reduce:transition-none!",
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
      className={cn(
        "relative col-span-full h-1.5 w-full rounded-full bg-muted",
        "shadow-[inset_0_1px_2px_rgb(0_0_0/0.07),inset_0_0_0_1px_rgb(0_0_0/0.035)]",
        "dark:shadow-[inset_0_1px_2px_rgb(0_0_0/0.5),inset_0_0_0_1px_rgb(255_255_255/0.04)]",
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
      className={cn(
        "rounded-full bg-primary",
        "shadow-[inset_0_1px_0_rgb(255_255_255/0.14)]",
        "group-data-high/meter:bg-destructive",
        className,
      )}
      {...props}
    />
  )
}

export { Meter, MeterIndicator, MeterLabel, MeterTrack, MeterValue }
