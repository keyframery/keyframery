"use client"

/* Animated keyboard keys. UI SDK has no counterpart, so these are plain elements: `Kbd` is a <kbd>,
   `KbdCombo` a row of them for a shortcut. This file adds motion only. Colours, radii, shadows and
   spacing stay yours (style `data-pressed` for the pressed look).

   - Press: a key sinks while `data-pressed` is on it (1px down, a touch smaller) and pops back on
     release with `ease-pop`.
   - In a combo pressed through `pressed`, the keys sink one after another, left to right.
   - `listen` follows the real keyboard: each key sinks while you hold it. */

import * as React from "react"

import { cn } from "@/lib/utils"

const isApple = () => typeof navigator !== "undefined" && /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent)

/* Names you can pass in `keys`, how they show, and how the keyboard reports them. */
const named: Record<string, { label: string | ((apple: boolean) => string); test: (e: KeyboardEvent) => boolean | null }> = {
  mod: { label: (apple) => (apple ? "⌘" : "Ctrl"), test: (e) => (isApple() ? e.metaKey : e.ctrlKey) },
  meta: { label: "⌘", test: (e) => e.metaKey },
  cmd: { label: "⌘", test: (e) => e.metaKey },
  ctrl: { label: (apple) => (apple ? "⌃" : "Ctrl"), test: (e) => e.ctrlKey },
  shift: { label: "⇧", test: (e) => e.shiftKey },
  alt: { label: (apple) => (apple ? "⌥" : "Alt"), test: (e) => e.altKey },
  option: { label: "⌥", test: (e) => e.altKey },
  enter: { label: "↵", test: () => null },
  escape: { label: "Esc", test: () => null },
  esc: { label: "Esc", test: () => null },
  backspace: { label: "⌫", test: () => null },
  tab: { label: "⇥", test: () => null },
  space: { label: "Space", test: () => null },
  up: { label: "↑", test: () => null },
  down: { label: "↓", test: () => null },
  left: { label: "←", test: () => null },
  right: { label: "→", test: () => null },
}

/* The value of `KeyboardEvent.key` for each non-modifier name. */
const eventKey: Record<string, string> = {
  enter: "enter",
  escape: "escape",
  esc: "escape",
  backspace: "backspace",
  tab: "tab",
  space: " ",
  up: "arrowup",
  down: "arrowdown",
  left: "arrowleft",
  right: "arrowright",
}

function keyLabel(key: string, apple = isApple()) {
  const entry = named[key.toLowerCase()]
  if (!entry) return key.length === 1 ? key.toUpperCase() : key
  return typeof entry.label === "function" ? entry.label(apple) : entry.label
}

/* Server-rendered pages can't know the platform, so they show the Windows labels and the
   client switches to ⌘ after hydration instead of rendering a mismatch. */
const noop = () => () => {}
function useApple() {
  return React.useSyncExternalStore(noop, isApple, () => false)
}

/* Press: sinks fast, pops back with a little overshoot. */
const kbdMotion = cn(
  "inline-flex origin-bottom",
  "transition-[translate,scale,box-shadow,background-color] duration-[calc(320ms*var(--kf-speed,1))] ease-pop",
  "data-pressed:translate-y-px data-pressed:scale-[0.93] data-pressed:duration-[calc(90ms*var(--kf-speed,1))] data-pressed:ease-house",
  "motion-reduce:transition-none!",
)

function Kbd({ className, pressed, ...props }: React.ComponentProps<"kbd"> & { pressed?: boolean }) {
  return <kbd data-slot="kbd" data-pressed={pressed || undefined} className={cn(kbdMotion, className)} {...props} />
}

/* Which of `keys` the keyboard is holding right now. */
function useHeldKeys(keys: string[], listen: boolean) {
  const [held, setHeld] = React.useState<boolean[]>(() => keys.map(() => false))
  const signature = keys.join("+").toLowerCase()

  React.useEffect(() => {
    if (!listen) return
    const names = signature.split("+")
    const down = new Set<string>()
    const update = (e: KeyboardEvent | null) => {
      setHeld((prev) => {
        const next = names.map((name) => {
          const modifier = named[name]?.test
          const asModifier = e && modifier ? modifier(e) : null
          if (asModifier !== null && asModifier !== undefined) return asModifier
          return down.has(eventKey[name] ?? name)
        })
        return next.every((v, i) => v === prev[i]) && next.length === prev.length ? prev : next
      })
    }
    const onDown = (e: KeyboardEvent) => {
      down.add(e.key.toLowerCase())
      update(e)
    }
    const onUp = (e: KeyboardEvent) => {
      down.delete(e.key.toLowerCase())
      /* With Command held, browsers send no keyup for the other keys: let go of them with it. */
      if (e.key === "Meta") down.clear()
      update(e)
    }
    const onBlur = () => {
      down.clear()
      setHeld(names.map(() => false))
    }
    window.addEventListener("keydown", onDown)
    window.addEventListener("keyup", onUp)
    window.addEventListener("blur", onBlur)
    return () => {
      window.removeEventListener("keydown", onDown)
      window.removeEventListener("keyup", onUp)
      window.removeEventListener("blur", onBlur)
    }
  }, [listen, signature])

  return held
}

function KbdCombo({
  keys,
  pressed = false,
  listen = false,
  className,
  kbdClassName,
  ...props
}: Omit<React.ComponentProps<"span">, "children"> & {
  /** The keys, in order: names like "mod", "shift", "alt", "enter", "escape", or a character. */
  keys: string[]
  /** Sinks every key, one after another. */
  pressed?: boolean
  /** Sinks each key while it is held on the real keyboard. */
  listen?: boolean
  /** Class names for each key. */
  kbdClassName?: string
}) {
  const apple = useApple()
  const held = useHeldKeys(keys, listen)
  return (
    <span
      data-slot="kbd-combo"
      data-pressed={pressed || undefined}
      aria-keyshortcuts={keys.join("+")}
      className={cn(
        "inline-flex items-center",
        /* In sequence: each key sinks a beat after the one before it; all pop back together. */
        "data-pressed:[&>[data-slot=kbd]]:[transition-delay:calc((min(sibling-index(),6)-1)*calc(70ms*var(--kf-speed,1)))]",
        className,
      )}
      {...props}
    >
      {keys.map((key, i) => (
        <Kbd key={`${key}-${i}`} pressed={pressed || held[i]} className={kbdClassName}>
          {keyLabel(key, apple)}
        </Kbd>
      ))}
    </span>
  )
}

export { Kbd, KbdCombo, keyLabel }
