/* A chat message, as UI SDK primitives. UI SDK ships no message, so these are defined with its core:
   the same definitions render in React, Vue, Svelte, Solid and web components.

   `message` lays out one turn of a conversation: who sent it (avatar), a header (name, time), the
   content (bubbles, attachments) and a footer (read, edited). `align` puts your own messages on the
   other side. A message plays its entrance when it mounts, unless it was already there when its
   message scroller first showed. `messageGroup` stacks messages. */

import { definePrimitive } from "@ui-sdk/core"

import { bindAgentContent } from "@/components/core/agent-content"
import { enter } from "@/components/core/message-scroller"

type MessageOptions = {
  /** `"start"` for the other person, `"end"` for your own: the avatar and bubbles move across. */
  align?: "start" | "end"
}

type MessageState = { align: "start" | "end"; content: string }

const message = definePrimitive({
  name: "message",
  options: { align: "string" },
  state: (options: MessageOptions): MessageState => ({ align: options.align ?? "start", content: "" }),
  sync: (options) => ({ align: options.align ?? "start" }),
  controlled: ["align", "content"],
  api: () => ({}),
  slots: (slot) => ({
    root: slot<{}, Pick<MessageState, "align">>({
      state: (state) => ({ align: state.align }),
      attrs: (state) => ({ "data-align": state.align }),
      bind: (el, part) => {
        enter(el)
        return bindAgentContent(el, (content) => part.store.set({ content }))
      },
    }),
    avatar: slot({}),
    content: slot({}),
    header: slot({}),
    footer: slot({}),
  }),
  /* Messages are readable entries; actions belong to the controls they contain. */
  agent: { actions: [] },
})

const messageGroup = definePrimitive({
  name: "message-group",
  state: () => ({}),
  controlled: [],
  api: () => ({}),
  slots: (slot) => ({
    root: slot({}),
  }),
  agent: { actions: [] },
})

export { message, messageGroup, type MessageOptions }
