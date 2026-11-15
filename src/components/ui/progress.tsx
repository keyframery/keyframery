"use client"

/* Styled progress: the animated primitive plus the Keyframery look. */

import {
  Progress as ProgressRoot,
  ProgressIndicator as ProgressIndicatorPart,
  ProgressLabel as ProgressLabelPart,
  ProgressTrack as ProgressTrackPart,
  ProgressValue as ProgressValuePart,
} from "@/components/primitives/progress"
import * as React from "react"

import { cn } from "@/lib/utils"

/* Label and value share the first row; the track spans the row below. */
function Progress({ className, ...props }: React.ComponentProps<typeof ProgressRoot>) {
  return (
    <ProgressRoot
      className={cn(
        "group/progress grid w-full grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-3 gap-y-2",
        className,
      )}
      {...props}
    />
  )
}

function ProgressLabel({ className, ...props }: React.ComponentProps<typeof ProgressLabelPart>) {
  return (
    <ProgressLabelPart
      className={cn("truncate text-[13px] leading-5 font-medium text-foreground", className)}
      {...props}
    />
  )
}

function ProgressValue({ className, ...props }: React.ComponentProps<typeof ProgressValuePart>) {
  return (
    <ProgressValuePart
      className={cn(
        "col-start-2 text-[13px] leading-5 text-muted-foreground tabular-nums",
        "transition-colors duration-[calc(150ms*var(--kf-speed,1))] data-complete:text-foreground motion-reduce:transition-none!",
        className,
      )}
      {...props}
    />
  )
}

/* The track is a thin pill well. */
function ProgressTrack({ className, ...props }: React.ComponentProps<typeof ProgressTrackPart>) {
  return (
    <ProgressTrackPart
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

/* The fill springs to each new width and the indeterminate bar slides (from the primitive).
   When the task finishes it turns green once. */
function ProgressIndicator({
  className,
  ...props
}: React.ComponentProps<typeof ProgressIndicatorPart>) {
  return (
    <ProgressIndicatorPart
      className={cn(
        "rounded-full bg-primary",
        "shadow-[inset_0_1px_0_rgb(255_255_255/0.14)]",
        "data-complete:bg-[oklch(0.62_0.16_150)]",
        "motion-reduce:data-indeterminate:opacity-30",
        className,
      )}
      {...props}
    />
  )
}

export { Progress, ProgressIndicator, ProgressLabel, ProgressTrack, ProgressValue }
