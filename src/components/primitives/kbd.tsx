"use client"

/* Animated keyboard keys, on UI SDK's core. UI SDK ships no kbd, so the behaviour is defined in
   `@/components/core/kbd` with `definePrimitive` and rendered here: `Kbd` is a <kbd>, `KbdCombo` a
   row of them for a shortcut. This file adds motion only. Colours, radii, shadows and spacing stay
   yours (style `data-pressed` for the pressed look).

   - Press: a key sinks while `data-pressed` is on it (1px down, a touch smaller) and pops back on
     release with `ease-pop`.
   - In a combo pressed through `pressed`, the keys sink one after another, left to right.
   - `listen` follows the real keyboard: each key sinks while you hold it. */

import { createParts, type PartProps, usePart } from "@ui-sdk/react/primitive"
import type { StateOf } from "@ui-sdk/core"
import * as React from "react"

import { kbd, kbdCombo, keyLabel } from "@/components/core/kbd"
import { cn } from "@/lib/utils"

const { Root: KbdRoot } = createParts(kbd, { root: "kbd" })
const { Root: KbdComboRoot } = createParts(kbdCombo, { root: "span", key: "kbd" })

/* UI SDK parts take a class name or a function of the part's state. Keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

/* Press: sinks fast, pops back with a little overshoot. */
const kbdMotion = cn(
  "inline-flex origin-bottom",
  "transition-[translate,scale,box-shadow,background-color] duration-[calc(320ms*var(--kf-speed,1))] ease-pop",
  "data-pressed:translate-y-px data-pressed:scale-[0.93] data-pressed:duration-[calc(90ms*var(--kf-speed,1))] data-pressed:ease-house",
  "motion-reduce:transition-none!",
)

function Kbd({ className, ...props }: React.ComponentProps<typeof KbdRoot>) {
  return <KbdRoot className={withClass(kbdMotion, className)} {...props} />
}

/* One key of a combo. With no children it shows the key's label: "mod" is ⌘ or Ctrl. */
function KbdComboKey({
  value,
  className,
  children,
  ...props
}: { value: string } & Omit<PartProps<"kbd", StateOf<typeof kbdCombo, "key">>, "value">) {
  return usePart(
    kbdCombo,
    "key",
    { value },
    { ...props, className: withClass(kbdMotion, className), children: children ?? ((state) => state.label) },
    "kbd",
  )
}

function KbdCombo({
  keys,
  className,
  kbdClassName,
  children,
  ...props
}: Omit<React.ComponentProps<typeof KbdComboRoot>, "keys"> & {
  /** The keys, in order: names like "mod", "shift", "alt", "enter", "escape", or a character. */
  keys: string[]
  /** Class names for each key. */
  kbdClassName?: string
}) {
  return (
    <KbdComboRoot
      keys={keys}
      className={withClass(
        cn(
          "inline-flex items-center",
          /* In sequence: each key sinks a beat after the one before it; all pop back together. */
          "data-pressed:[&>[data-slot=kbd-combo-key]]:[transition-delay:calc((min(sibling-index(),6)-1)*calc(70ms*var(--kf-speed,1)))]",
        ),
        className,
      )}
      {...props}
    >
      {children ?? keys.map((key) => <KbdComboKey key={key} value={key} className={kbdClassName} />)}
    </KbdComboRoot>
  )
}

export { Kbd, KbdCombo, KbdComboKey, keyLabel }
