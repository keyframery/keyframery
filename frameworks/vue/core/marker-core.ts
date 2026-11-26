/* A marker, as a UI SDK primitive. UI SDK ships no marker, so it is defined with its core: the same
   definition renders in React, Vue, Svelte, Solid and web components.

   A marker is a short line inside a stream of content that says where you are or what happened:
   "Today" between two days of messages, "Ana joined", "Searching the knowledge base". It can sit
   between two rules (`separator`) or over one (`border`). A marker that reports something as it
   happens is `live`: it becomes a status that screen readers read out when its text changes. While
   `pending`, the work it names is still running. */

import { definePrimitive } from "@ui-sdk/core"

import { bindAgentContent } from "@/components/keyframery/core/agent-content-core"

type MarkerVariant = "default" | "separator" | "border"

type MarkerOptions = {
  /** `"separator"` draws a rule on each side of the content, `"border"` a rule under it. */
  variant?: MarkerVariant
  /** Reads the marker out when its text changes, as a status. */
  live?: boolean
  /** The work the marker names is still going on. */
  pending?: boolean
}

type MarkerState = { variant: MarkerVariant; live: boolean; pending: boolean; content: string }

const marker = definePrimitive({
  name: "marker",
  options: { variant: "string", live: "boolean", pending: "boolean" },
  state: (options: MarkerOptions): MarkerState => ({
    variant: options.variant ?? "default",
    live: options.live ?? false,
    pending: options.pending ?? false,
    content: "",
  }),
  sync: (options) => ({
    variant: options.variant ?? "default",
    live: options.live ?? false,
    pending: options.pending ?? false,
  }),
  controlled: ["pending", "live", "content"],
  api: () => ({}),
  slots: (slot) => ({
    root: slot<{}, { variant: MarkerVariant; pending: boolean }>({
      role: (state) => (state.live ? "status" : undefined),
      roles: ["status"],
      state: (state) => ({ variant: state.variant, pending: state.pending }),
      attrs: (state) => ({
        "data-variant": state.variant,
        "data-pending": state.pending ? "" : undefined,
        "aria-busy": state.live && state.pending ? "true" : undefined,
      }),
      bind: (el, part) => bindAgentContent(el, (content) => part.store.set({ content })),
    }),
    /* The icon repeats what the words say, so it is hidden from screen readers. */
    icon: slot<{}, { pending: boolean }>({
      state: (state) => ({ pending: state.pending }),
      attrs: (state) => ({ "aria-hidden": "true", "data-pending": state.pending ? "" : undefined }),
    }),
    content: slot<{}, { pending: boolean }>({
      state: (state) => ({ pending: state.pending }),
      attrs: (state) => ({ "data-pending": state.pending ? "" : undefined }),
    }),
  }),
  /* Agents read whether the work is pending; a marker has no actions. */
  agent: { actions: [] },
})

export { marker, type MarkerOptions, type MarkerVariant }
