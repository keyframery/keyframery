/* A field with things around it, as a UI SDK primitive: icons, text, buttons and counters on either
   side of an input, or above and below a textarea. UI SDK's own InputGroup (in `@ui-sdk/react/input`)
   holds an Input and a clear button on one line; this one adds shadcn/ui's addons on four sides, a
   textarea, and a character count.

   The control inside is UI SDK's own Input or Textarea (Keyframery's, in the styled file); this
   primitive never binds to it. It listens as events bubble to the group instead, and keeps what the
   group's look needs in state: whether the control is focused, filled, invalid or disabled, how
   many characters it holds and its `maxLength`. Pressing an addon's text or icon focuses the control. */

import { definePrimitive } from "@ui-sdk/core"

type Align = "inline-start" | "inline-end" | "block-start" | "block-end"

type InputGroupState = {
  /** Keyboard or pointer focus is in the control (not in a button of the group). */
  focused: boolean
  /** Focus in the control came from the keyboard, so the ring shows. */
  focusVisible: boolean
  filled: boolean
  /** Characters in the control. */
  length: number
  /** The control's `maxLength`, or 0 when it has none. */
  max: number
  invalid: boolean
  disabled: boolean
  /** The control is a textarea. */
  multiline: boolean
}

const CONTROL = "input, textarea"

function controlOf(root: Element | null) {
  return root?.querySelector<HTMLInputElement | HTMLTextAreaElement>(CONTROL) ?? null
}

function read(control: HTMLInputElement | HTMLTextAreaElement | null): Partial<InputGroupState> {
  if (!control) return {}
  return {
    filled: control.value.length > 0,
    length: control.value.length,
    max: control.maxLength > 0 ? control.maxLength : 0,
    invalid: control.getAttribute("aria-invalid") === "true",
    disabled: control.disabled,
    multiline: control instanceof HTMLTextAreaElement,
  }
}

/* Writes only what changed, so a keystroke that changes nothing the group shows renders nothing. */
function same(a: Partial<InputGroupState>, b: InputGroupState) {
  return (Object.keys(a) as (keyof InputGroupState)[]).every((key) => a[key] === b[key])
}

const inputGroup = definePrimitive({
  name: "input-group",
  state: (): InputGroupState => ({
    focused: false,
    focusVisible: false,
    filled: false,
    length: 0,
    max: 0,
    invalid: false,
    disabled: false,
    multiline: false,
  }),
  controlled: ["invalid", "disabled", "multiline", "max"],
  api: (context) => {
    const { store } = context
    const update = (next: Partial<InputGroupState>) => {
      if (!same(next, store.get())) store.set(next)
    }
    return {
      /** Reads the control again: its text, length, limit and whether it is invalid or disabled. */
      refresh(root: HTMLElement) {
        update(read(controlOf(root)))
      },
      focusIn(event: FocusEvent, root: HTMLElement) {
        const target = event.target as Element
        const inControl = target.matches(CONTROL)
        update({ ...read(controlOf(root)), focused: inControl, focusVisible: inControl && target.matches(":focus-visible") })
      },
      focusOut(event: FocusEvent, root: HTMLElement) {
        const next = event.relatedTarget as Element | null
        const stillIn = !!next && root.contains(next) && next.matches(CONTROL)
        update({ ...read(controlOf(root)), focused: stillIn, focusVisible: stillIn && store.get().focusVisible })
      },
      /** Moves focus into the control, as a press on an addon's text or icon does. */
      focusControl(from: Element) {
        const control = controlOf(from.closest('[data-slot="input-group"]'))
        if (control && !control.disabled) control.focus()
      },
    }
  },
  slots: (slot) => ({
    root: slot<{}, InputGroupState>({
      role: "group",
      state: (state) => state,
      attrs: (state) => ({
        "data-focused": state.focused ? "" : undefined,
        "data-focus-visible": state.focusVisible ? "" : undefined,
        "data-filled": state.filled ? "" : undefined,
        "data-invalid": state.invalid ? "" : undefined,
        "data-disabled": state.disabled ? "" : undefined,
        "data-multiline": state.multiline ? "" : undefined,
      }),
      on: {
        focusin: (event, { el, api }) => el && api.focusIn(event as FocusEvent, el),
        focusout: (event, { el, api }) => el && api.focusOut(event as FocusEvent, el),
        input: (_event, { el, api }) => el && api.refresh(el),
        change: (_event, { el, api }) => el && api.refresh(el),
      },
      bind: (el, part) => {
        part.api.refresh(el)
        /* A field or form can flip `aria-invalid` and `disabled` without an event. */
        const observer = new MutationObserver(() => part.api.refresh(el))
        observer.observe(el, { subtree: true, attributes: true, attributeFilter: ["aria-invalid", "disabled", "maxlength"] })
        return () => observer.disconnect()
      },
    }),
    /* Icons, text, buttons or a count beside or around the control. */
    addon: slot<{ align?: Align }, { align: Align; focused: boolean; filled: boolean }>({
      role: "group",
      props: { align: "string" },
      state: (state, part) => ({ align: part.props.align ?? "inline-start", focused: state.focused, filled: state.filled }),
      attrs: (_state, part) => ({ "data-align": part.props.align ?? "inline-start" }),
      on: {
        /* Text and icons in an addon focus the control, like a label. Buttons and links keep their own press. */
        click: (event, { el, api }) => {
          const target = event.target as Element
          if (!el || target.closest("button, a, input, textarea, select, [role=button]")) return
          api.focusControl(el)
        },
      },
    }),
    /* Plain words in an addon: a unit, a prefix like "https://", a hint. */
    text: slot({}),
    /* How many characters the control holds, or how many are left under its `maxLength`. */
    count: slot<{ show?: "used" | "left" }, { value: number; length: number; max: number; near: boolean }>({
      props: { show: "string" },
      state: (state, part) => {
        const left = state.max ? state.max - state.length : 0
        return {
          value: part.props.show === "left" && state.max ? left : state.length,
          length: state.length,
          max: state.max,
          near: state.max > 0 && left <= Math.max(1, Math.round(state.max * 0.1)),
        }
      },
      attrs: (state) => {
        const left = state.max ? state.max - state.length : 0
        return {
          "data-near-limit": state.max > 0 && left <= Math.max(1, Math.round(state.max * 0.1)) ? "" : undefined,
          "data-at-limit": state.max > 0 && left <= 0 ? "" : undefined,
        }
      },
    }),
  }),
  /* Expose validation and control metadata; the Input or Textarea owns its value and actions. */
  agent: { actions: [] },
})

export { type Align as InputGroupAlign, inputGroup }
