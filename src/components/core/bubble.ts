/* Chat bubbles, as UI SDK primitives. UI SDK ships no bubble, so these are defined with its core:
   the same definitions render in React, Vue, Svelte, Solid and web components.

   `bubble` is one bubble: a root that carries its variant and side, the content (the bubble you
   see), and reactions pinned to its edge. `bubbleGroup` stacks bubbles from one sender. A bubble
   plays its entrance when it mounts, unless it sits in a message that was already there when its
   message scroller first showed. */

import { definePrimitive } from "@ui-sdk/core"

import { enter } from "@/components/core/message-scroller"

type BubbleVariant = "default" | "secondary" | "muted" | "tinted" | "outline" | "ghost" | "destructive"

type BubbleOptions = {
  /** How the bubble is filled. */
  variant?: BubbleVariant
  /** Which side it hangs from: `"start"` for the other person, `"end"` for your own. */
  align?: "start" | "end"
}

type BubbleState = { variant: BubbleVariant; align: "start" | "end" }

const bubble = definePrimitive({
  name: "bubble",
  options: { variant: "string", align: "string" },
  state: (options: BubbleOptions): BubbleState => ({
    variant: options.variant ?? "default",
    align: options.align ?? "start",
  }),
  sync: (options) => ({ variant: options.variant ?? "default", align: options.align ?? "start" }),
  controlled: [],
  api: () => ({}),
  slots: (slot) => ({
    root: slot<{}, BubbleState>({
      state: (state) => ({ variant: state.variant, align: state.align }),
      attrs: (state) => ({ "data-variant": state.variant, "data-align": state.align }),
      bind: (el) => {
        enter(el)
      },
    }),
    content: slot<{}, BubbleState>({
      state: (state) => ({ variant: state.variant, align: state.align }),
    }),
    reactions: slot<{ side?: "top" | "bottom"; align?: "start" | "end" }, { side: "top" | "bottom"; align: "start" | "end" }>({
      props: { side: "string", align: "string" },
      state: (_state, part) => ({ side: part.props.side ?? "bottom", align: part.props.align ?? "end" }),
      attrs: (_state, part) => ({ "data-side": part.props.side ?? "bottom", "data-align": part.props.align ?? "end" }),
      bind: (el) => {
        enter(el)
      },
    }),
  }),
  /* A bubble shows words. An agent reads them from the page; there is nothing to do with it. */
  agent: { actions: [], shown: () => false },
})

const bubbleGroup = definePrimitive({
  name: "bubble-group",
  state: () => ({}),
  controlled: [],
  api: () => ({}),
  slots: (slot) => ({
    root: slot({}),
  }),
  agent: { actions: [], shown: () => false },
})

export { bubble, bubbleGroup, type BubbleOptions, type BubbleVariant }
