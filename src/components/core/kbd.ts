/* Keyboard keys, as UI SDK primitives. UI SDK ships no kbd, so these are defined with its core:
   the same definitions render in React, Vue, Svelte, Solid and web components.

   `kbd` is one key. `kbdCombo` is a shortcut: a row of keys that can sink together (`pressed`) or
   follow the real keyboard (`listen`), each one sinking while it is held. */

import { definePrimitive } from "@ui-sdk/core"

const isApple = () => typeof navigator !== "undefined" && /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent)

/* Names a combo takes, how they show, and how the keyboard reports the modifiers. */
const named: Record<string, { label: string | ((apple: boolean) => string); test?: (event: KeyboardEvent) => boolean }> = {
  mod: { label: (apple) => (apple ? "⌘" : "Ctrl"), test: (event) => (isApple() ? event.metaKey : event.ctrlKey) },
  meta: { label: "⌘", test: (event) => event.metaKey },
  cmd: { label: "⌘", test: (event) => event.metaKey },
  ctrl: { label: (apple) => (apple ? "⌃" : "Ctrl"), test: (event) => event.ctrlKey },
  shift: { label: "⇧", test: (event) => event.shiftKey },
  alt: { label: (apple) => (apple ? "⌥" : "Alt"), test: (event) => event.altKey },
  option: { label: "⌥", test: (event) => event.altKey },
  enter: { label: "↵" },
  escape: { label: "Esc" },
  esc: { label: "Esc" },
  backspace: { label: "⌫" },
  tab: { label: "⇥" },
  space: { label: "Space" },
  up: { label: "↑" },
  down: { label: "↓" },
  left: { label: "←" },
  right: { label: "→" },
}

/* `KeyboardEvent.key`, lower case, for each name that isn't a modifier. */
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

/** What a key is called on the keycap: "mod" is ⌘ on Apple platforms and Ctrl elsewhere. */
function keyLabel(key: string, apple = isApple()) {
  const entry = named[key.toLowerCase()]
  if (!entry) return key.length === 1 ? key.toUpperCase() : key
  return typeof entry.label === "function" ? entry.label(apple) : entry.label
}

type KbdOptions = {
  /** Draws the key pressed in. */
  pressed?: boolean
}

const kbd = definePrimitive({
  name: "kbd",
  options: { pressed: "boolean" },
  state: (options: KbdOptions) => ({ pressed: options.pressed ?? false }),
  sync: (options) => ({ pressed: options.pressed ?? false }),
  controlled: [],
  api: () => ({}),
  slots: (slot) => ({
    root: slot<{}, { pressed: boolean }>({
      state: (state) => ({ pressed: state.pressed }),
      attrs: (state) => ({ "data-pressed": state.pressed ? "" : undefined }),
    }),
  }),
  /* A keycap is a label. It has nothing for an agent to read or do. */
  agent: { actions: [], shown: () => false },
})

type KbdComboOptions = {
  /** The keys, in order: names like "mod", "shift", "alt", "enter", "escape", or a character. */
  keys?: string[]
  /** Sinks every key, one after another. */
  pressed?: boolean
  /** Sinks each key while it is held on the real keyboard. */
  listen?: boolean
}

type KbdComboState = {
  keys: string[]
  pressed: boolean
  /** The names in `keys` the keyboard is holding now. */
  held: string[]
  /** False on the server and for the first client render, so the page hydrates without a mismatch. */
  apple: boolean
}

const kbdCombo = definePrimitive({
  name: "kbd-combo",
  options: { keys: "list", pressed: "boolean", listen: "boolean" },
  state: (options: KbdComboOptions): KbdComboState => ({
    keys: options.keys ?? [],
    pressed: options.pressed ?? false,
    held: [],
    apple: false,
  }),
  sync: (options) => ({ keys: options.keys ?? [], pressed: options.pressed ?? false }),
  controlled: [],
  api: (context) => {
    const down = new Set<string>()
    const setHeld = (held: string[]) => {
      const now = context.store.get().held
      if (held.length !== now.length || held.some((name, index) => name !== now[index])) context.store.set({ held })
    }
    const read = (event: KeyboardEvent | null) =>
      setHeld(
        context.store.get().keys.filter((key) => {
          const name = key.toLowerCase()
          const modifier = named[name]?.test
          return event && modifier ? modifier(event) : down.has(eventKey[name] ?? name)
        }),
      )
    return {
      /** Follows the keyboard while `listen` is on. Returns the function that stops it. */
      watch() {
        context.store.set({ apple: isApple() })
        const onDown = (event: KeyboardEvent) => {
          if (!context.options().listen) return
          down.add(event.key.toLowerCase())
          read(event)
        }
        const onUp = (event: KeyboardEvent) => {
          if (!context.options().listen) return
          down.delete(event.key.toLowerCase())
          /* With Command held, browsers send no keyup for the other keys: let go of them with it. */
          if (event.key === "Meta") down.clear()
          read(event)
        }
        const onBlur = () => {
          down.clear()
          setHeld([])
        }
        window.addEventListener("keydown", onDown)
        window.addEventListener("keyup", onUp)
        window.addEventListener("blur", onBlur)
        return () => {
          window.removeEventListener("keydown", onDown)
          window.removeEventListener("keyup", onUp)
          window.removeEventListener("blur", onBlur)
        }
      },
    }
  },
  slots: (slot) => ({
    root: slot<{}, { pressed: boolean }>({
      state: (state) => ({ pressed: state.pressed }),
      attrs: (state) => ({
        "data-pressed": state.pressed ? "" : undefined,
        "aria-keyshortcuts": state.keys.length ? state.keys.join("+") : undefined,
      }),
      bind: (_el, part) => part.api.watch(),
    }),
    key: slot<{ value: string }, { pressed: boolean; label: string }>({
      props: { value: "key" },
      state: (state, part) => ({
        pressed: state.pressed || state.held.includes(part.key),
        label: keyLabel(part.key, state.apple),
      }),
      attrs: (state, part) => ({ "data-pressed": state.pressed || state.held.includes(part.key) ? "" : undefined }),
    }),
  }),
  agent: { actions: [], shown: () => false },
})

export { kbd, kbdCombo, type KbdComboOptions, type KbdOptions, keyLabel }
