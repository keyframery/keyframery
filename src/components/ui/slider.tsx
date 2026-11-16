"use client"

/* Styled slider: the animated primitive plus the Keyframery look. */

import * as React from "react"

import {
  Slider as SliderRoot,
  SliderControl as SliderControlPart,
  SliderIndicator as SliderIndicatorPart,
  SliderThumb as SliderThumbPart,
  SliderTrack as SliderTrackPart,
  SliderValue as SliderValuePart,
} from "@/components/primitives/slider"
import { Speed, type SpeedProps } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

function Slider({ speed, className, ...props }: React.ComponentProps<typeof SliderRoot> & SpeedProps) {
  return (
    <Speed speed={speed}>
      <SliderRoot
        className={cn(
          "group/slider flex w-full flex-col gap-2 data-[orientation=vertical]:h-full data-[orientation=vertical]:w-auto",
          "data-disabled:opacity-50",
          className as string,
        )}
        {...props}
      />
    </Speed>
  )
}

/* The number rolls digit by digit (from the primitive), in tabular figures. */
function SliderValue({
  className,
  ...props
}: React.ComponentProps<typeof SliderValuePart>) {
  return (
    <SliderValuePart
      className={cn("text-[13px] leading-none font-medium tabular-nums", className as string)}
      {...props}
    />
  )
}

/* Where presses land: 20px tall around a thin track, with 8px of side room so the
   thumb never hangs outside the control at either end. */
function SliderControl({
  className,
  ...props
}: React.ComponentProps<typeof SliderControlPart>) {
  return (
    <SliderControlPart
      className={cn(
        "relative flex h-5 w-full cursor-pointer touch-none items-center px-2 select-none",
        "data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-40 data-[orientation=vertical]:w-5 data-[orientation=vertical]:flex-col data-[orientation=vertical]:px-0 data-[orientation=vertical]:py-2",
        "data-disabled:cursor-not-allowed",
        className as string,
      )}
      {...props}
    />
  )
}

/* The track: a thin pill well. */
function SliderTrack({
  className,
  ...props
}: React.ComponentProps<typeof SliderTrackPart>) {
  return (
    <SliderTrackPart
      className={cn(
        "h-1.5 w-full rounded-full bg-muted",
        "shadow-[inset_0_1px_1px_rgb(0_0_0/0.08),inset_0_0_0_1px_rgb(0_0_0/0.04)]",
        "dark:bg-accent dark:shadow-[inset_0_1px_2px_rgb(0_0_0/0.5),inset_0_0_0_1px_rgb(255_255_255/0.04)]",
        "data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5",
        className as string,
      )}
      {...props}
    />
  )
}

/* The filled range. */
function SliderIndicator({
  className,
  ...props
}: React.ComponentProps<typeof SliderIndicatorPart>) {
  return (
    <SliderIndicatorPart
      className={cn(
        "rounded-full bg-primary shadow-[inset_0_1px_0_rgb(255_255_255/0.14)]",
        className as string,
      )}
      {...props}
    />
  )
}

/* The thumb: a round key; the primitive grows it with a pop while it is held. */
function SliderThumb({
  className,
  ...props
}: React.ComponentProps<typeof SliderThumbPart>) {
  return (
    <SliderThumbPart
      className={cn(
        "block size-4 rounded-full bg-background",
        "shadow-[0_0_0_1px_rgb(0_0_0/0.1),0_1px_1px_rgb(0_0_0/0.06),0_2px_5px_-1px_rgb(0_0_0/0.16)]",
        "dark:bg-[color-mix(in_oklab,var(--foreground),var(--background)_8%)] dark:shadow-[0_0_0_1px_rgb(0_0_0/0.3),0_1px_3px_rgb(0_0_0/0.5)]",
        "group-not-data-disabled/slider:hover:shadow-[0_0_0_1px_rgb(0_0_0/0.16),0_1px_1px_rgb(0_0_0/0.06),0_3px_7px_-1px_rgb(0_0_0/0.2)]",
        "group-not-data-disabled/slider:cursor-grab data-dragging:cursor-grabbing",
        "data-dragging:shadow-[0_0_0_1px_rgb(0_0_0/0.12),0_2px_3px_rgb(0_0_0/0.08),0_6px_12px_-2px_rgb(0_0_0/0.22)]",
        "dark:data-dragging:shadow-[0_0_0_1px_rgb(0_0_0/0.3),0_4px_10px_rgb(0_0_0/0.6)]",
        "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-background",
        className as string,
      )}
      {...props}
    />
  )
}

export { Slider, SliderControl, SliderIndicator, SliderThumb, SliderTrack, SliderValue }
