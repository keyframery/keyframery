"use client"

/* Styled motion style switcher: a segmented control whose key stretches between the four styles.
   It mounts MotionStyle itself, so dropping it anywhere applies the choice to <html>. */

import * as React from "react"

import {
  MotionStyle,
  motionStyle,
  type MotionStylePreference,
  motionStyles,
  type MotionStyleValue,
  usePreference,
} from "@/components/primitives/motion-style"
import { SegmentedControl, SegmentedControlItem } from "@/components/ui/segmented-control"

const labels: Record<MotionStyleValue, string> = {
  calm: "Calm",
  springy: "Springy",
  snappy: "Snappy",
  playful: "Playful",
}

function MotionStyleSwitcher({
  preference = motionStyle,
  "aria-label": ariaLabel = "Motion style",
  ...props
}: Omit<React.ComponentProps<typeof SegmentedControl>, "value" | "defaultValue" | "onValueChange" | "children"> & {
  preference?: MotionStylePreference
}) {
  const { value } = usePreference(preference)
  return (
    <MotionStyle preference={preference}>
      <SegmentedControl
        aria-label={ariaLabel}
        value={value}
        onValueChange={(next, details) => {
          if (next) preference.set(next as MotionStyleValue, { reason: "press", event: details.event })
        }}
        {...props}
      >
        {motionStyles.map((style) => (
          <SegmentedControlItem key={style} value={style}>
            {labels[style]}
          </SegmentedControlItem>
        ))}
      </SegmentedControl>
    </MotionStyle>
  )
}

export { createMotionStyle, MotionStyle, motionStyle, motionStyles, type MotionStyleValue } from "@/components/primitives/motion-style"
export { MotionStyleSwitcher }
