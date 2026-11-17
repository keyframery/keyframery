/* A native <select>, as a UI SDK primitive. UI SDK ships a custom Select; this one keeps the
   browser's own picker (the wheel on a phone, the system menu on a desktop) and adds what a styled
   one needs: the value in state, a change callback with a reason, the label of the chosen option
   for a value part that can animate, and state attributes for the look.

   Parts: `root` (the wrapper), `control` (the <select>), `value` (the chosen option's label, drawn
   over the select), `icon` (the chevron), `option` and `optgroup`. */

import { type ChangeDetails, createChange, definePrimitive, elements } from "@ui-sdk/core"

// "input-change" isn't in the shared vocabulary: the browser reports a native pick as a `change` event.
type NativeSelectValueChangeReason = "input-change" | "imperative"

type NativeSelectOptions = {
  /** The chosen option's value, for a controlled select. */
  value?: string
  /** The value it starts with. */
  defaultValue?: string
  /** Called when the chosen option changes: picked in the browser's menu (`"input-change"`) or set from code (`"imperative"`). `details.cancel()` keeps the old one. */
  onValueChange?: (value: string, details: ChangeDetails<NativeSelectValueChangeReason>) => void
  /** `"sm"` is 32px tall, `"default"` 36px. */
  size?: "sm" | "default"
  /** Disables the select. */
  disabled?: boolean
  /** Marks the value as wrong: the select gets `aria-invalid`. */
  invalid?: boolean
}

type NativeSelectState = {
  /** Null until the select is in the page and the browser has said which option it shows. */
  value: string | null
  /** The chosen option's text. */
  label: string
  /** The label before the last change, so a value part can show it leaving. */
  previous: string
  /** Counts changes, so the value part can replay its motion on each one. */
  changes: number
  size: "sm" | "default"
  disabled: boolean
  invalid: boolean
}

const optionLabel = (select: HTMLSelectElement) => select.selectedOptions[0]?.text.trim() ?? ""

const nativeSelect = definePrimitive({
  name: "native-select",
  options: {
    value: "string",
    defaultValue: "string",
    onValueChange: "callback",
    size: "string",
    disabled: "boolean",
    invalid: "boolean",
  },
  controlled: ["value"],
  state: (options: NativeSelectOptions): NativeSelectState => ({
    value: options.value ?? options.defaultValue ?? null,
    label: "",
    previous: "",
    changes: 0,
    size: options.size ?? "default",
    disabled: options.disabled ?? false,
    invalid: options.invalid ?? false,
  }),
  sync: (options) => ({
    ...(options.value === undefined ? {} : { value: options.value }),
    size: options.size ?? "default",
    disabled: options.disabled ?? false,
    invalid: options.invalid ?? false,
  }),
  api: (context) => {
    const change = createChange(context)
    const { store } = context
    const control = () => context.element("control") as HTMLSelectElement | null

    /* The select shows what state says, and state keeps the label of what it shows. A new label
       after the first one counts as a change, from a pick, from code or from a controlled value. */
    const show = () => {
      const select = control()
      if (!select) return
      const { value, label } = store.get()
      if (value === null) {
        store.set({ value: select.value, label: optionLabel(select) })
        return
      }
      if (select.value !== value) select.value = value
      const next = optionLabel(select)
      if (next !== label) store.set(label ? { label: next, previous: label, changes: store.get().changes + 1 } : { label: next })
    }

    return {
      show,
      /** Chooses the option with this value. */
      setValue(value: string) {
        return change("value", value, { reason: "imperative" })
      },
      /** Handles a pick in the browser's menu. A refused or controlled change puts the old option back. */
      pick(event: Event) {
        const select = event.target as HTMLSelectElement
        change("value", select.value, { reason: "input-change", event })
        show()
      },
      focus() {
        control()?.focus()
      },
      /** The options on the page, for an agent. */
      items() {
        return elements<{ value: string }>(context, "option").map((option) => ({
          value: option.key,
          label: option.el.textContent?.trim() || option.key,
        }))
      },
    }
  },
  slots: (slot) => ({
    root: slot<{}, { disabled: boolean; invalid: boolean }>({
      state: (state) => ({ disabled: state.disabled, invalid: state.invalid }),
      attrs: (state) => ({
        "data-size": state.size,
        "data-disabled": state.disabled ? "" : undefined,
        "data-invalid": state.invalid ? "" : undefined,
      }),
    }),
    control: slot<{}, { value: string | null; disabled: boolean; invalid: boolean }>({
      state: (state) => ({ value: state.value, disabled: state.disabled, invalid: state.invalid }),
      attrs: (state) => ({
        "data-size": state.size,
        disabled: state.disabled ? "" : undefined,
        "aria-invalid": state.invalid ? "true" : undefined,
        "data-placeholder": state.value === "" ? "" : undefined,
      }),
      on: { change: (event, { api }) => api.pick(event) },
      bind: (_el, part) => {
        part.api.show()
        return part.store.subscribe(() => part.api.show())
      },
    }),
    value: slot<{}, { label: string; previous: string; changes: number; placeholder: boolean }>({
      state: (state) => ({
        label: state.label,
        previous: state.previous,
        changes: state.changes,
        placeholder: state.value === "",
      }),
      attrs: (state) => ({
        "aria-hidden": "true",
        "data-placeholder": state.value === "" ? "" : undefined,
        "data-changed": state.changes ? "" : undefined,
      }),
    }),
    icon: slot<{}, { changes: number }>({
      state: (state) => ({ changes: state.changes }),
      attrs: () => ({ "aria-hidden": "true" }),
    }),
    option: slot<{ value: string }>({
      props: { value: "string" },
      attrs: (_state, part) => ({ value: part.key }),
    }),
    optgroup: slot({}),
  }),
  /* The value is always one of its options. */
  agent: { actions: ["setValue"], closed: true, items: (api) => api.items() },
})

export { nativeSelect, type NativeSelectOptions, type NativeSelectValueChangeReason }
