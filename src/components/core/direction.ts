/* Reading direction, as a UI SDK primitive. UI SDK's rule is that right to left needs no provider:
   its components read the direction from the page (`isRTL(el)`, the computed `direction`), so
   arrow keys, positions and stretches already mirror wherever `dir="rtl"` applies. What a page
   still needs is a part that sets `dir` (and `lang`) for the content inside it, a way to flip it,
   and a way to read it. That is this primitive, defined with UI SDK's core: the same definition
   renders in React, Vue, Svelte, Solid and web components.

   It holds no context. Everything inside reads the direction from the element, as UI SDK's own
   components do, so a component that knows nothing of this one mirrors with it. */

import { type ChangeDetails, createChange, definePrimitive, isRTL } from "@ui-sdk/core"

type Dir = "ltr" | "rtl"

// "toggle-press" isn't in UI SDK's shared vocabulary.
type DirChangeReason = "toggle-press" | "imperative"

type DirectionOptions = {
  /** The reading direction of the content inside, when you control it. */
  dir?: Dir
  /** The reading direction to start with, when the part keeps it. Defaults to `"ltr"`. */
  defaultDir?: Dir
  /** Called when the direction is asked to change. */
  onDirChange?: (dir: Dir, details: ChangeDetails<DirChangeReason>) => void
  /** The language of the content inside, written as `lang` beside `dir`. */
  lang?: string
}

type DirectionState = {
  dir: Dir
  lang: string | undefined
  /** How many times the direction has changed since the part mounted. */
  flips: number
}

/** The direction an element is laid out in, from its computed style. */
function directionOf(el: Element | null | undefined): Dir {
  return isRTL(el) ? "rtl" : "ltr"
}

/** Calls `onChange` whenever a `dir` attribute anywhere in the page changes the direction `el` is
    laid out in. Returns the function that stops watching. */
function watchDirection(el: Element, onChange: (dir: Dir) => void) {
  let current = directionOf(el)
  const observer = new MutationObserver(() => {
    const next = directionOf(el)
    if (next === current) return
    current = next
    onChange(next)
  })
  observer.observe(el.ownerDocument.documentElement, { attributes: true, attributeFilter: ["dir"], subtree: true })
  return () => observer.disconnect()
}

const labels: Record<Dir, string> = { ltr: "Left to right", rtl: "Right to left" }

const direction = definePrimitive({
  name: "direction",
  options: { dir: "string", defaultDir: "string", onDirChange: "callback", lang: "string" },
  controlled: ["dir"],
  state: (options: DirectionOptions): DirectionState => ({
    dir: options.dir ?? options.defaultDir ?? "ltr",
    lang: options.lang,
    flips: 0,
  }),
  sync: (options) => ({ ...(options.dir === undefined ? {} : { dir: options.dir }), lang: options.lang }),
  api: (context) => {
    const change = createChange(context)
    /* Count every change of direction, controlled or not, so the content can play its move only
       after one (never on first load). */
    let last = context.store.get().dir
    context.onDestroy(
      context.store.subscribe(() => {
        const { dir, flips } = context.store.get()
        if (dir === last) return
        last = dir
        context.store.set({ flips: flips + 1 })
      }),
    )
    return {
      /** Sets the reading direction. */
      setDir: (dir: Dir, event?: Event) => change("dir", dir, { reason: "imperative", event }),
      /** Switches between left to right and right to left. */
      toggle: (event?: Event) =>
        change("dir", context.store.get().dir === "rtl" ? "ltr" : "rtl", { reason: "toggle-press", event }),
    }
  },
  slots: (slot) => ({
    root: slot<{}, { dir: Dir; flipped: boolean }>({
      state: (state) => ({ dir: state.dir, flipped: state.flips > 0 }),
      attrs: (state) => ({
        dir: state.dir,
        lang: state.lang,
        "data-dir": state.dir,
        "data-flipped": state.flips > 0 ? "" : undefined,
      }),
    }),
    /* A button that flips the direction. Pressed while the content reads right to left. */
    toggle: slot<{}, { dir: Dir }>({
      role: "button",
      focus: "native",
      press: ({ api }, event) => api.toggle(event),
      state: (state) => ({ dir: state.dir }),
      attrs: (state) => ({
        type: "button",
        "aria-pressed": String(state.dir === "rtl"),
        "data-dir": state.dir,
      }),
    }),
  }),
  agent: {
    actions: ["setDir", "toggle"],
    closed: true,
    items: () => (["ltr", "rtl"] as const).map((value) => ({ value, label: labels[value] })),
  },
})

export { type Dir, direction, directionOf, type DirectionOptions, watchDirection }
