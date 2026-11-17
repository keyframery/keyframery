"use client"

export * from "@/components/primitives/kbd"

/* Styled keyboard keys: the animated primitive plus the Keyframery look. A small key with a 1px ledge
   under it; pressed, it sinks into the ledge and the face takes a soft inner shadow.

   Theming: set these CSS variables on a key, a combo or anything around them. Each falls back to
   the theme's own token, so a key looks the same until you set one.
     --kbd-face     the key's surface            (default: --background, --accent in dark)
     --kbd-ink      the label                    (default: --muted-foreground)
     --kbd-size     the key's height and least width  (default: 1.5rem)
     --kbd-radius   the corners                  (default: 6px)
     --kbd-font     the label's size             (default: 12px) */

import * as React from "react"

import { Kbd as KbdPrimitive, KbdCombo as KbdComboPrimitive } from "@/components/primitives/kbd"
import { Speed, type SpeedProps } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

const key = cn(
  "h-[var(--kbd-size,1.5rem)] min-w-[var(--kbd-size,1.5rem)] items-center justify-center rounded-[var(--kbd-radius,6px)] px-1.5 font-sans text-[length:var(--kbd-font,12px)] leading-none font-medium text-[color:var(--kbd-ink,var(--muted-foreground))] tabular-nums select-none",
  "bg-[var(--kbd-face,var(--background))] shadow-[0_0_0_1px_rgb(0_0_0/0.08),0_1px_0_0_rgb(0_0_0/0.1),inset_0_0_0_0_transparent]",
  "dark:bg-[var(--kbd-face,var(--accent))] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_1px_0_0_rgb(0_0_0/0.6),inset_0_1px_0_0_rgb(255_255_255/0.07)]",
  /* Pressed: the face darkens a step from whatever colour it has, and the label goes to full ink. */
  "data-pressed:bg-[color-mix(in_oklab,var(--kbd-face,var(--muted)),var(--foreground)_6%)] data-pressed:text-[color:var(--kbd-ink,var(--foreground))] data-pressed:shadow-[0_0_0_1px_rgb(0_0_0/0.1),0_0_0_0_rgb(0_0_0/0.1),inset_0_1px_2px_0_rgb(0_0_0/0.12)]",
  "dark:data-pressed:bg-[color-mix(in_oklab,var(--kbd-face,var(--muted)),var(--foreground)_6%)] dark:data-pressed:shadow-[0_0_0_1px_rgb(255_255_255/0.06),0_0_0_0_rgb(0_0_0/0.6),inset_0_1px_3px_0_rgb(0_0_0/0.5)]",
)

/* UI SDK parts take a class name or a function of the part's state. Keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

function Kbd({ speed, className, ...props }: React.ComponentProps<typeof KbdPrimitive> & SpeedProps) {
  return (
    <Speed speed={speed}>
      <KbdPrimitive className={withClass(key, className)} {...props} />
    </Speed>
  )
}

function KbdCombo({ className, kbdClassName, ...props }: React.ComponentProps<typeof KbdComboPrimitive>) {
  return <KbdComboPrimitive className={withClass("gap-1", className)} kbdClassName={cn(key, kbdClassName)} {...props} />
}

export { Kbd, KbdCombo }
export { keyLabel } from "@/components/primitives/kbd"
