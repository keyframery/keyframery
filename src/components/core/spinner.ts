/* Spinner, as a UI SDK primitive. UI SDK ships no spinner, so it is defined with its core: the
   same definition renders in React, Vue, Svelte, Solid and web components.

   A spinner says something is loading. It is `role="status"` with a name ("Loading" unless you
   give it another), so a screen reader hears it when it appears. */

import { definePrimitive } from "@ui-sdk/core"

type SpinnerVariant = "ring" | "spokes"

type SpinnerOptions = {
  /** What a screen reader hears. @defaultValue "Loading" */
  label?: string
  /** The drawing: `"ring"`, an arc that turns and stretches, or `"spokes"`, eight spokes fading round. @defaultValue "ring" */
  variant?: SpinnerVariant
}

const spinner = definePrimitive({
  name: "spinner",
  options: { label: "string", variant: "string" },
  state: (options: SpinnerOptions) => ({ label: options.label ?? "Loading", variant: options.variant ?? "ring" }),
  sync: (options) => ({ label: options.label ?? "Loading", variant: options.variant ?? "ring" }),
  controlled: [],
  api: () => ({}),
  slots: (slot) => ({
    root: slot<{}, { label: string; variant: SpinnerVariant }>({
      role: "status",
      state: (state) => ({ label: state.label, variant: state.variant }),
      attrs: (state) => ({ "aria-label": state.label, "data-variant": state.variant }),
    }),
  }),
  /* A spinner only shows that something is busy: nothing for an agent to read or do. */
  agent: { actions: [], shown: () => false },
})

export { spinner, type SpinnerOptions, type SpinnerVariant }
