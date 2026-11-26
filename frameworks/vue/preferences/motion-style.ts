/* Keyframery's own preference: the motion style (framework-free, the same as the React primitive).

   The motion style is the preference every Keyframery component already follows. Each duration is
   written as calc(Nms * var(--kf-speed, 1)) and each easing reads --ease-house, --ease-spring or
   --ease-pop, so one `data-motion` attribute changes how the whole set moves: subtle (the default:
   quiet, no bounce, --kf-flourish 0 so only feedback moves), calm (slower, no bounce), springy,
   snappy (fast, crisp) and playful (more spring).

   `motionStyle` is global (on <html>, so popups at the end of <body> follow it too) and saved in
   localStorage. Mount `MotionStyle` once to apply it. `createMotionStyle({ global: false })` makes a
   scoped one: its attribute goes on the MotionStyle element (display: contents) and only the
   content inside follows it. */
import { createLocalStorage, createPreference } from "@ui-sdk/core"

export const motionStyles = ["subtle", "calm", "springy", "snappy", "playful"] as const

export type MotionStyleValue = (typeof motionStyles)[number]

export function createMotionStyle({
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
    defaultValue: "subtle",
    attribute: "data-motion",
    global,
    storage: storageKey ? createLocalStorage(storageKey) : undefined,
  })
}

export type MotionStylePreference = ReturnType<typeof createMotionStyle>

export const motionStyle = createMotionStyle()

export const motionLabels: Record<MotionStyleValue, string> = {
  subtle: "Subtle",
  calm: "Calm",
  springy: "Springy",
  snappy: "Snappy",
  playful: "Playful",
}
