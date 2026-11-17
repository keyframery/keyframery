"use client"

export * from "@/components/primitives/progress"

/* Theming (inherited; each default preserves the original light/dark appearance):
   --progress-fill: In-progress fill (default: --primary)
   --progress-track: Track surface (default: --muted)
   --progress-ink: Label and completed value (default: --foreground)
   --progress-value-ink: Value text (default: --muted-foreground)
   --progress-complete: Completed fill (default: oklch(0.62 0.16 150))
   --progress-height: Track height (default: 0.375rem)
   --progress-radius: Track and fill corners (default: 9999px)
   --progress-gap: Label to track gap (default: 0.5rem)
*/

/* Styled progress: the animated primitive plus the Keyframery look. */

import {
  Progress as ProgressRoot,
  ProgressIndicator as ProgressIndicatorPart,
  ProgressLabel as ProgressLabelPart,
  ProgressTrack as ProgressTrackPart,
  ProgressValue as ProgressValuePart,
} from "@/components/primitives/progress"
import * as React from "react"

import { Speed, type SpeedProps } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

/* Label and value share the first row; the track spans the row below. */
function Progress({ speed, className, ...props }: React.ComponentProps<typeof ProgressRoot> & SpeedProps) {
  return (
    <Speed speed={speed}>
      <ProgressRoot
        className={withClass("group/progress grid w-full grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-3 gap-y-[var(--progress-gap,0.5rem)]", className)}
        {...props}
      />
    </Speed>
  )
}

function ProgressLabel({ className, ...props }: React.ComponentProps<typeof ProgressLabelPart>) {
  return (
    <ProgressLabelPart
      className={withClass("truncate text-[13px] leading-5 font-medium text-[color:var(--progress-ink,var(--foreground))]", className)}
      {...props}
    />
  )
}

function ProgressValue({ className, ...props }: React.ComponentProps<typeof ProgressValuePart>) {
  return (
    <ProgressValuePart
      className={withClass(
        cn(
          "col-start-2 text-[13px] leading-5 text-[color:var(--progress-value-ink,var(--muted-foreground))] tabular-nums",
          "transition-colors duration-[calc(150ms*var(--kf-speed,1))] data-complete:text-[color:var(--progress-ink,var(--foreground))] motion-reduce:transition-none!",
        ),
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
      className={withClass(
        cn(
          "relative col-span-full h-[var(--progress-height,0.375rem)] w-full rounded-[var(--progress-radius,9999px)] bg-[var(--progress-track,var(--muted))]",
          "shadow-[inset_0_1px_2px_rgb(0_0_0/0.07),inset_0_0_0_1px_rgb(0_0_0/0.035)]",
          "dark:shadow-[inset_0_1px_2px_rgb(0_0_0/0.5),inset_0_0_0_1px_rgb(255_255_255/0.04)]",
        ),
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
      className={withClass(
        cn(
          "rounded-[var(--progress-radius,9999px)] bg-[var(--progress-fill,var(--primary))]",
          "shadow-[inset_0_1px_0_rgb(255_255_255/0.14)]",
          "data-complete:bg-[var(--progress-complete,oklch(0.62_0.16_150))]",
          "motion-reduce:data-indeterminate:opacity-30",
        ),
        className,
      )}
      {...props}
    />
  )
}

export { Progress, ProgressIndicator, ProgressLabel, ProgressTrack, ProgressValue }
