/* A trace: the steps an assistant or a job went through, one line each, as a UI SDK primitive. UI SDK
   ships none, so it is defined with its core: the same definition renders in React, Vue, Svelte,
   Solid and web components.

   A line has a status (running, error, pending, or done when it has none) and a title. When a line
   stops running, screen readers hear its new title once, so "Searching flights" becoming "Found
   12 flights" is announced without a live region on the whole list. Lines that expand are UI SDK's
   collapsible, composed in the renderer: this primitive adds no open state of its own. */

import { announce, definePrimitive } from "@ui-sdk/core"

import { bindAgentContent } from "@/components/core/agent-content"

/** A line's state. Leave it out for a step that finished. */
type TraceStatus = "running" | "error" | "pending"

const statusAttr = (status: string | undefined) => (status === "running" || status === "error" || status === "pending" ? status : undefined)

const trace = definePrimitive({
  name: "trace",
  options: {},
  state: () => ({ content: "" }),
  controlled: ["content"],
  api: () => ({}),
  slots: (slot) => ({
    root: slot({
      state: () => ({}),
      bind: (el, part) => bindAgentContent(el, (content) => part.store.set({ content })),
    }),
    line: slot<{ status?: TraceStatus }, { status: TraceStatus | undefined }>({
      props: { status: "string" },
      state: (_state, part) => ({ status: statusAttr(part.props.status) as TraceStatus | undefined }),
      attrs: (_state, part) => ({
        "data-status": statusAttr(part.props.status),
        "data-done": statusAttr(part.props.status) ? undefined : "",
      }),
      /* Reads the title out once when the step stops running or fails. */
      bind: (el) => {
        let was = el.getAttribute("data-status")
        const observer = new MutationObserver(() => {
          const now = el.getAttribute("data-status")
          if (now === was) return
          const ended = was === "running" && now !== "running"
          was = now
          if (!ended) return
          const title = el.querySelector("[data-slot=trace-title]")?.textContent?.trim()
          if (title) announce(title, { priority: now === "error" ? "assertive" : "polite" })
        })
        observer.observe(el, { attributes: true, attributeFilter: ["data-status"] })
        return () => observer.disconnect()
      },
    }),
    /* Decorative: the title is the line's name. */
    icon: slot({
      attrs: () => ({ "aria-hidden": "true" }),
    }),
    title: slot({}),
    description: slot({}),
  }),
  /* Expose the trace's titles and descriptions; expanding rows are separate collapsibles. */
  agent: { actions: [] },
})

export { trace, type TraceStatus }
