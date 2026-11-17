/* A row (or column) of joined buttons, as a UI SDK primitive. UI SDK ships Button and Toolbar but no
   button group, so it is defined here with `definePrimitive`.

   It is a WAI-ARIA `group`: each control keeps its own tab stop, as in shadcn/ui. For one tab stop
   and arrow keys, put the controls in a Toolbar instead.

   The group follows the pointer and keyboard focus across its buttons and puts the one under them
   in state, as a box (`--highlight-left`, `--highlight-top`, `--highlight-width`,
   `--highlight-height`, `--highlight-radius` on the root), so one highlight can glide between
   segments instead of each segment lighting up on its own. */

import { css, definePrimitive } from "@ui-sdk/core"

type ButtonGroupOptions = {
  /** Lays the buttons out in a row or a column. */
  orientation?: "horizontal" | "vertical"
}

type Box = { left: number; top: number; width: number; height: number; radius: string }

type ButtonGroupState = {
  orientation: "horizontal" | "vertical"
  /** The box of the button under the pointer or keyboard focus. It stays at the last one while nothing is highlighted, so the highlight fades where it was. */
  box: Box | null
  /** Whether a button is highlighted now. */
  highlighted: boolean
  /** True while the highlight moves from one button to the next, false when it appears from nothing. */
  gliding: boolean
}

/* What the highlight can rest on: buttons and links straight inside the group, not a nested
   group, a field or a disabled control. */
const PRESSABLE = 'button, a[href], [role="button"]'

function itemFrom(root: HTMLElement, target: EventTarget | null): HTMLElement | null {
  let node = target instanceof HTMLElement ? target : null
  while (node && node.parentElement !== root) node = node.parentElement
  if (!node || !node.matches(PRESSABLE)) return null
  if (node.matches(':disabled, [data-disabled], [aria-disabled="true"]')) return null
  return node
}

const boxOf = (el: HTMLElement): Box => ({
  left: el.offsetLeft,
  top: el.offsetTop,
  width: el.offsetWidth,
  height: el.offsetHeight,
  radius: getComputedStyle(el).borderRadius,
})

const buttonGroup = definePrimitive({
  name: "button-group",
  options: { orientation: "string" },
  state: (options: ButtonGroupOptions): ButtonGroupState => ({
    orientation: options.orientation ?? "horizontal",
    box: null,
    highlighted: false,
    gliding: false,
  }),
  sync: (options) => ({ orientation: options.orientation ?? "horizontal" }),
  controlled: [],
  api: (context) => {
    const { store } = context
    let pointerInside = false

    const highlight = (item: HTMLElement | null) => {
      const now = store.get()
      if (!item) {
        if (now.highlighted) store.set({ highlighted: false })
        return
      }
      store.set({ box: boxOf(item), gliding: now.highlighted, highlighted: true })
    }

    return {
      /** The pointer moved over the group. */
      pointerOver(event: Event, root: HTMLElement) {
        pointerInside = true
        const item = itemFrom(root, event.target)
        if (item) highlight(item)
      },
      /** The pointer left: the highlight goes back to a keyboard-focused button, or fades. */
      pointerLeave(root: HTMLElement) {
        pointerInside = false
        const focused = root.querySelector(":focus-visible")
        highlight(focused ? itemFrom(root, focused) : null)
      },
      focusIn(event: FocusEvent, root: HTMLElement) {
        const target = event.target as HTMLElement
        if (!pointerInside && target.matches(":focus-visible")) highlight(itemFrom(root, target))
      },
      focusOut(event: FocusEvent, root: HTMLElement) {
        if (!pointerInside && !root.contains(event.relatedTarget as Node | null)) highlight(null)
      },
    }
  },
  slots: (slot) => ({
    root: slot<{}, { orientation: "horizontal" | "vertical"; highlighted: boolean }>({
      role: "group",
      state: (state) => ({ orientation: state.orientation, highlighted: state.highlighted }),
      attrs: (state) => ({
        "data-orientation": state.orientation,
        "data-highlighted": state.highlighted ? "" : undefined,
        "data-gliding": state.highlighted && state.gliding ? "" : undefined,
        style: state.box
          ? css({
              "--highlight-left": `${state.box.left}px`,
              "--highlight-top": `${state.box.top}px`,
              "--highlight-width": `${state.box.width}px`,
              "--highlight-height": `${state.box.height}px`,
              "--highlight-radius": state.box.radius,
            })
          : undefined,
      }),
      on: {
        pointerover: (event, { el, api }) => el && api.pointerOver(event, el),
        pointerleave: (_event, { el, api }) => el && api.pointerLeave(el),
        focusin: (event, { el, api }) => el && api.focusIn(event as FocusEvent, el),
        focusout: (event, { el, api }) => el && api.focusOut(event as FocusEvent, el),
      },
    }),
    /* Words or an icon that belong to the group but don't press, like a unit or a label. */
    text: slot({}),
  }),
  /* The group only arranges buttons; each button is its own entry for an agent. */
  agent: { actions: [], shown: () => false },
})

export { buttonGroup, type ButtonGroupOptions }
