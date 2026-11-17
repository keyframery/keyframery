"use client"

export * from "@/components/primitives/preferences"

/* Theming (inherited; each default preserves the original light/dark appearance):
   --preferences-track: Switcher well (default: --muted)
   --preferences-key: Selected key (default: --background, --accent in dark)
   --preferences-ink: Unselected text (default: --muted-foreground)
   --preferences-selected-ink: Selected text (default: --foreground)
   --preferences-height: Option height (default: 2rem)
   --preferences-radius: Well corners (default: 12px)
   --preferences-key-radius: Option corners (default: 9px)
   --preferences-gap: Option gap (default: 0.125rem)
*/

/* Styled preferences: UI SDK's Preferences and usePreference, a switcher for any preference, and
   the motion style switcher built from it. */

import type { Preference } from "@ui-sdk/core"
import * as React from "react"

import {
  MotionStyle,
  motionStyle,
  type MotionStylePreference,
  type MotionStyleValue,
  Preferences,
  usePreference,
} from "@/components/primitives/preferences"
import { cn } from "@/lib/utils"
import { SegmentedControl, SegmentedControlItem } from "@/components/ui/segmented-control"

const words = (value: string) => value.replace(/[-_]+/g, " ").replace(/^./, (first) => first.toUpperCase())

/* A segmented control that shows a preference and sets it, one item per value. Its key stretches
   to the value you pick. A global preference is applied to <html> by the switcher itself; for a
   scoped one, wrap the content it styles in `Preferences`. */
function PreferenceSwitcher<Value extends string>({
  preference,
  labels,
  className,
  style,
  ...props
}: Omit<React.ComponentProps<typeof SegmentedControl>, "value" | "defaultValue" | "onValueChange" | "children"> & {
  /** The preference to show and set, from `createPreference`. */
  preference: Preference<Value>
  /** What each value is called. A value without a label is shown as written, capitalised. */
  labels?: Partial<Record<Value, React.ReactNode>>
}) {
  const { value } = usePreference(preference)
  const theme = {
    "--segmented-control-track": "var(--preferences-track,var(--muted))",
    "--segmented-control-key": "var(--preferences-key,var(--kf-preferences-key))",
    "--segmented-control-ink": "var(--preferences-ink,var(--muted-foreground))",
    "--segmented-control-selected-ink": "var(--preferences-selected-ink,var(--foreground))",
    "--segmented-control-height": "var(--preferences-height,2rem)",
    "--segmented-control-radius": "var(--preferences-radius,12px)",
    "--segmented-control-key-radius": "var(--preferences-key-radius,9px)",
    "--segmented-control-gap": "var(--preferences-gap,0.125rem)",
  } as React.CSSProperties
  const appearance = "[--kf-preferences-key:var(--background)] dark:[--kf-preferences-key:var(--accent)]"
  const control = (
    <SegmentedControl
      value={value}
      onValueChange={(next, details) => {
        if (next) preference.set(next as Value, { reason: "press", event: details.event })
      }}
      {...props}
      className={typeof className === "function" ? (state) => cn(appearance, className(state)) : cn(appearance, className)}
      style={typeof style === "function" ? (state) => ({ ...theme, ...style(state) }) : { ...theme, ...style }}
    >
      {preference.values.map((option) => (
        <SegmentedControlItem key={option} value={option}>
          {labels?.[option] ?? words(option)}
        </SegmentedControlItem>
      ))}
    </SegmentedControl>
  )
  return preference.global ? <Preferences preferences={[preference]}>{control}</Preferences> : control
}

const motionLabels: Record<MotionStyleValue, string> = {
  calm: "Calm",
  springy: "Springy",
  snappy: "Snappy",
  playful: "Playful",
}

/* The motion style switcher: Calm, Springy, Snappy or Playful for every Keyframery component.
   Dropping it anywhere applies the choice to <html> and remembers it. */
function MotionStyleSwitcher({
  preference = motionStyle,
  "aria-label": ariaLabel = "Motion style",
  ...props
}: Omit<React.ComponentProps<typeof PreferenceSwitcher<MotionStyleValue>>, "preference" | "labels"> & {
  /** The motion style preference to show and set. Defaults to the global `motionStyle`. */
  preference?: MotionStylePreference
}) {
  return <PreferenceSwitcher preference={preference} labels={motionLabels} aria-label={ariaLabel} {...props} />
}

export {
  createMotionStyle,
  MotionStyle,
  motionStyle,
  type MotionStylePreference,
  motionStyles,
  type MotionStyleValue,
  Preferences,
  type PreferencesProps,
  usePreference,
} from "@/components/primitives/preferences"
export { MotionStyleSwitcher, PreferenceSwitcher }
