/* Cards, as a UI SDK primitive. UI SDK ships no card, so it is defined with its core: the same
   definition renders in React, Vue, Svelte, Solid and web components.

   A card is a surface with shadcn's parts (header, title, description, action, content, footer).
   An `interactive` card follows the pointer: `data-hovered` while it is over the card and
   `data-pressed` while it is held down (or Space or Enter is held on it). A `spotlight` card also
   keeps the pointer's position, and writes it as `--kf-x` and `--kf-y` for a light to follow.
   What a press does stays the author's (their `onClick`, `role` and `tabIndex`). */

import { definePrimitive } from "@ui-sdk/core"

type CardOptions = {
  /** Lifts on hover and sinks while pressed. */
  interactive?: boolean
  /** A soft light that follows the pointer. */
  spotlight?: boolean
}

type CardState = {
  interactive: boolean
  spotlight: boolean
  hovered: boolean
  pressed: boolean
  /** The pointer, in px from the card's top left corner. Changes often, so it is written to the element directly. */
  x: number | undefined
  y: number | undefined
}

const card = definePrimitive({
  name: "card",
  options: { interactive: "boolean", spotlight: "boolean" },
  state: (options: CardOptions): CardState => ({
    interactive: options.interactive ?? false,
    spotlight: options.spotlight ?? false,
    hovered: false,
    pressed: false,
    x: undefined,
    y: undefined,
  }),
  sync: (options) => ({ interactive: options.interactive ?? false, spotlight: options.spotlight ?? false }),
  controlled: [],
  live: ["x", "y"],
  api: (context) => {
    const { store } = context
    const tracks = () => store.get().interactive || store.get().spotlight
    /* Turning tracking off lets go of a hover or press it was showing. */
    context.onOptions((options) => {
      if (options.interactive || options.spotlight) return
      if (store.get().hovered || store.get().pressed) store.set({ hovered: false, pressed: false })
    })
    return {
      /** The pointer came over the card, or left it. Leaving lets go of a press too. */
      hover(hovered: boolean) {
        if (!tracks()) return
        if (hovered !== store.get().hovered || (!hovered && store.get().pressed))
          store.set(hovered ? { hovered } : { hovered, pressed: false })
      },
      /** The card is held down, or let go. */
      press(pressed: boolean) {
        if (!store.get().interactive && pressed) return
        if (pressed !== store.get().pressed) store.set({ pressed })
      },
      /** Where the pointer is, in px from the card's top left corner. */
      point(x: number, y: number) {
        if (store.get().spotlight) store.set({ x, y })
      },
    }
  },
  slots: (slot) => ({
    root: slot<{}, { interactive: boolean; spotlight: boolean; hovered: boolean; pressed: boolean }>({
      state: (state) => ({
        interactive: state.interactive,
        spotlight: state.spotlight,
        hovered: state.hovered,
        pressed: state.pressed,
      }),
      attrs: (state) => ({
        "data-interactive": state.interactive ? "" : undefined,
        "data-spotlight": state.spotlight ? "" : undefined,
        "data-hovered": state.hovered ? "" : undefined,
        "data-pressed": state.pressed ? "" : undefined,
      }),
      on: {
        pointerenter: (_event, { api }) => api.hover(true),
        pointerleave: (_event, { api }) => api.hover(false),
        pointermove: (event, { api, el }) => {
          const pointer = event as PointerEvent
          const box = el?.getBoundingClientRect()
          if (!box) return
          api.point(pointer.clientX - box.left, pointer.clientY - box.top)
        },
        pointerdown: (event, { api }) => {
          if ((event as PointerEvent).button === 0) api.press(true)
        },
        pointerup: (_event, { api }) => api.press(false),
        pointercancel: (_event, { api }) => api.press(false),
        /* A card someone made focusable and pressable sinks while Space or Enter is held on it. */
        keydown: (event, { api, el }) => {
          const key = (event as KeyboardEvent).key
          if (event.target === el && (key === " " || key === "Enter") && !(event as KeyboardEvent).repeat) api.press(true)
        },
        keyup: (event, { api, el }) => {
          const key = (event as KeyboardEvent).key
          if (event.target === el && (key === " " || key === "Enter")) api.press(false)
        },
        blur: (_event, { api }) => api.press(false),
      },
      /* The light's position changes on every pointer move, so it goes straight to the element as
         two CSS variables instead of rendering the card again. */
      bind: (el, part) => {
        let last: { x: number | undefined; y: number | undefined } = { x: undefined, y: undefined }
        const write = () => {
          const { x, y } = part.store.get()
          if (x === last.x && y === last.y) return
          last = { x, y }
          if (x === undefined || y === undefined) {
            el.style.removeProperty("--kf-x")
            el.style.removeProperty("--kf-y")
          } else {
            el.style.setProperty("--kf-x", `${x}px`)
            el.style.setProperty("--kf-y", `${y}px`)
          }
        }
        write()
        return part.store.subscribe(write)
      },
    }),
    header: slot({}),
    title: slot({}),
    description: slot({}),
    action: slot({}),
    content: slot({}),
    footer: slot({}),
  }),
  /* A card is a surface. Whatever an agent can do inside it belongs to the parts it holds. */
  agent: { actions: [], shown: () => false },
})

export { card, type CardOptions }
