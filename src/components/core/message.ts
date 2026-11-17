/* A chat message, as UI SDK primitives. UI SDK ships no message, so these are defined with its core:
   the same definitions render in React, Vue, Svelte, Solid and web components.

   `message` lays out one turn of a conversation: who sent it (avatar), a header (name, time), the
   content (bubbles, attachments) and a footer (read, edited). `align` puts your own messages on the
   other side. A message plays its entrance when it mounts, unless it was already there when its
   message scroller first showed. `messageGroup` stacks messages. */

import { definePrimitive } from "@ui-sdk/core"

import { enter } from "@/components/core/message-scroller"

type MessageOptions = {
  /** `"start"` for the other person, `"end"` for your own: the avatar and bubbles move across. */
  align?: "start" | "end"
}

type MessageState = { align: "start" | "end" }

const message = definePrimitive({
  name: "message",
  options: { align: "string" },
  state: (options: MessageOptions): MessageState => ({ align: options.align ?? "start" }),
  sync: (options) => ({ align: options.align ?? "start" }),
  controlled: [],
  api: () => ({}),
  slots: (slot) => ({
    root: slot<{}, MessageState>({
      state: (state) => ({ align: state.align }),
      attrs: (state) => ({ "data-align": state.align }),
      bind: (el) => {
        enter(el)
      },
    }),
    avatar: slot({}),
    content: slot({}),
    header: slot({}),
    footer: slot({}),
  }),
  /* The words are page text an agent already reads; a message has nothing to do. */
  agent: { actions: [], shown: () => false },
})

const messageGroup = definePrimitive({
  name: "message-group",
  state: () => ({}),
  controlled: [],
  api: () => ({}),
  slots: (slot) => ({
    root: slot({}),
  }),
  agent: { actions: [], shown: () => false },
})

export { message, messageGroup, type MessageOptions }
