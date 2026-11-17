"use client"

export * from "@/components/primitives/direction"

/* Theming variables (set on a part or ancestor; absent values preserve the theme):
   --direction-face: Toggle surface; default: bg-background.
   --direction-ink: Toggle text; default: text-foreground.
   --direction-radius: Toggle corners; default: rounded-[9px].
   --direction-font: Toggle label size; default: text-[13px].
   --direction-gap: Toggle gap; default: gap-1.5.
   --direction-height: Toggle height; default: h-8.
   --direction-inset-x: Toggle padding; default: px-3.
   --direction-icon-size: Toggle icon; default: size-4.
*/

/* Styled reading direction: the animated primitive plus the Keyframery look. `Direction` has no
   look of its own (it is the content's box); `DirectionToggle` is a key with a mirror icon that
   turns over as the direction flips. */

import * as React from "react"

import {
  Direction as DirectionPrimitive,
  DirectionToggle as DirectionTogglePrimitive,
  directionOf,
  useDirection,
  type Dir,
} from "@/components/primitives/direction"
import { mapChildren, Speed, type SpeedProps } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

function Direction({ speed, ...props }: React.ComponentProps<typeof DirectionPrimitive> & SpeedProps) {
  return (
    <Speed speed={speed}>
      <DirectionPrimitive {...props} />
    </Speed>
  )
}

/* Two arrows facing each other's way: the toggle's icon. */
function MirrorIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 5.5h9.5M10 3l2.5 2.5L10 8" />
      <path d="M13 10.5H3.5M6 8l-2.5 2.5L6 13" opacity="0.5" />
    </svg>
  )
}

function DirectionToggle({ className, children, ...props }: React.ComponentProps<typeof DirectionTogglePrimitive>) {
  return (
    <DirectionTogglePrimitive
      className={withClass(
        cn(
          "inline-flex h-[var(--direction-height,2rem)] cursor-pointer items-center justify-center gap-[var(--direction-gap,0.375rem)] rounded-[var(--direction-radius,9px)] px-[var(--direction-inset-x,0.75rem)] text-[length:var(--direction-font,13px)] leading-none font-medium whitespace-nowrap text-[color:var(--direction-ink,var(--foreground))] outline-none select-none [&_svg]:size-[var(--direction-icon-size,1rem)] [&_svg]:shrink-0",
          "bg-[var(--direction-face,var(--background))] shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_1px_rgb(0_0_0/0.05),0_3px_6px_-2px_rgb(0_0_0/0.1)]",
          "dark:bg-[var(--direction-face,var(--accent))] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07),inset_0_1px_0_rgb(255_255_255/0.08),0_2px_6px_-1px_rgb(0_0_0/0.6)]",
          "hover:bg-[color-mix(in_oklab,var(--background),var(--foreground)_3%)] dark:hover:bg-[color-mix(in_oklab,var(--accent),var(--foreground)_7%)]",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        ),
        className,
      )}
      {...props}
    >
      {mapChildren(children, (content) => (
        <>
          <MirrorIcon />
          {content}
        </>
      ))}
    </DirectionTogglePrimitive>
  )
}

const DirectionProvider = Direction

export { Direction, DirectionProvider, DirectionToggle, directionOf, useDirection, type Dir }
