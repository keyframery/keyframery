"use client"

export * from "@/components/primitives/motion-style"

/* Theming (inherited; each default preserves the original light/dark appearance):
   --motion-style-track: Switcher well (default: --muted)
   --motion-style-key: Selected key (default: --background, --accent in dark)
   --motion-style-ink: Unselected text (default: --muted-foreground)
   --motion-style-selected-ink: Selected text (default: --foreground)
   --motion-style-height: Option height (default: 2rem)
   --motion-style-radius: Well corners (default: 12px)
   --motion-style-key-radius: Key corners (default: 9px)
   --motion-style-gap: Option gap (default: 0.125rem)
*/


/* The motion style switcher: a segmented control whose key stretches between the four styles.
   It applies the choice to <html> itself, so dropping it anywhere is enough.

   It is built in `@/components/ui/preferences`, on the preference switcher there, and passed
   through here under its own name. */

import * as React from "react"

import { MotionStyleSwitcher as MotionStyleSwitcherPart } from "@/components/ui/preferences"

export {
  createMotionStyle,
  MotionStyle,
  motionStyle,
  type MotionStylePreference,
  motionStyles,
  type MotionStyleValue,
} from "@/components/ui/preferences"

/* Theme aliases follow the shared switcher, including its dark key surface. */
function MotionStyleSwitcher({ style, ...props }: React.ComponentProps<typeof MotionStyleSwitcherPart>) {
  const theme = {
    "--preferences-track": "var(--motion-style-track,var(--muted))",
    "--preferences-key": "var(--motion-style-key,var(--kf-preferences-key))",
    "--preferences-ink": "var(--motion-style-ink,var(--muted-foreground))",
    "--preferences-selected-ink": "var(--motion-style-selected-ink,var(--foreground))",
    "--preferences-height": "var(--motion-style-height,2rem)",
    "--preferences-radius": "var(--motion-style-radius,12px)",
    "--preferences-key-radius": "var(--motion-style-key-radius,9px)",
    "--preferences-gap": "var(--motion-style-gap,0.125rem)",
  } as React.CSSProperties
  return <MotionStyleSwitcherPart {...props} style={typeof style === "function" ? (state) => ({ ...theme, ...style(state) }) : { ...theme, ...style }} />
}

export { MotionStyleSwitcher }
