"use client"

/* The motion style switcher: a segmented control whose key stretches between the four styles.
   It applies the choice to <html> itself, so dropping it anywhere is enough.

   It is built in `@/components/ui/preferences`, on the preference switcher there, and passed
   through here under its own name. */

export {
  createMotionStyle,
  MotionStyle,
  motionStyle,
  type MotionStylePreference,
  motionStyles,
  MotionStyleSwitcher,
  type MotionStyleValue,
} from "@/components/ui/preferences"
