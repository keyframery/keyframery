"use client"

/* Drop-in for `@ui-sdk/react/preferences`, plus Keyframery's own preference: the motion style.

   `Preferences` and `usePreference` pass through untouched. A preference only puts a value on a
   `data-*` attribute; what moves is whatever your CSS styles by it.

   The motion style is the preference every Keyframery component already follows. Each duration is
   written as calc(Nms * var(--kf-speed, 1)) and each easing reads --ease-house, --ease-spring or
   --ease-pop, so one `data-motion` attribute changes how the whole set moves: calm (slower, no
   bounce), springy (the default), snappy (fast, crisp) and playful (more spring).

   `motionStyle` is global (on <html>, so popups at the end of <body> follow it too) and saved in
   localStorage. Mount `MotionStyle` once to apply it. `createMotionStyle({ global: false })` makes a
   scoped one: its attribute goes on the MotionStyle element (display: contents) and only the
   content inside follows it. */

import { createLocalStorage, createPreference } from "@ui-sdk/core"
import { Preferences } from "@ui-sdk/react/preferences"
import * as React from "react"

export * from "@ui-sdk/react/preferences"

const motionStyles = ["calm", "springy", "snappy", "playful"] as const

type MotionStyleValue = (typeof motionStyles)[number]

function createMotionStyle({
  global = true,
  storageKey = "kf-motion-style",
}: {
  /** Put the attribute on <html> (default) or only on the MotionStyle element. */
  global?: boolean
  /** The localStorage key; null keeps the choice for this visit only. */
  storageKey?: string | null
} = {}) {
  return createPreference({
    values: motionStyles,
    defaultValue: "springy",
    attribute: "data-motion",
    global,
    storage: storageKey ? createLocalStorage(storageKey) : undefined,
  })
}

type MotionStylePreference = ReturnType<typeof createMotionStyle>

const motionStyle = createMotionStyle()

/* The springy reset (a springy area inside a calm page) lives in the motion tokens, with the other styles. */
function MotionStyle({
  preference = motionStyle,
  ...props
}: Omit<React.ComponentProps<typeof Preferences>, "preferences"> & { preference?: MotionStylePreference }) {
  return (
    <Preferences preferences={[preference]} {...props} />
  )
}

export { createMotionStyle, MotionStyle, motionStyle, type MotionStylePreference, motionStyles, type MotionStyleValue }
