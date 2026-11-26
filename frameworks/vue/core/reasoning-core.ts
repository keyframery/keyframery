/* Reasoning: the "thinking" a model did before it answered, behind a disclosure, as a UI SDK
   primitive. UI SDK ships none, so it is defined with its core: the same definition renders in React,
   Vue, Svelte, Solid and web components.

   It keeps time: while `streaming` is true it notes when the thinking started, and when it stops
   it keeps the seconds it took (unless a `duration` is given) and tells screen readers "Thought for
   12 seconds" once. Opening and closing is UI SDK's collapsible, composed in the renderer: this
   primitive adds no open state of its own. The renderer opens it while streaming and closes it when
   the thinking ends (`autoClose`), unless the reader toggled it in the meantime. */

import { announce, definePrimitive } from "@ui-sdk/core"

import { bindAgentContent } from "@/components/keyframery/core/agent-content-core"

type ReasoningOptions = {
  /** True while the model is still thinking. */
  streaming?: boolean
  /** How long it thought, in seconds. Without it, the time is measured from `streaming`. */
  duration?: number
}

type ReasoningState = {
  streaming: boolean
  duration: number | undefined
  /** Seconds measured between `streaming` turning on and off. */
  measured: number | undefined
  content: string
}

const now = () => (typeof performance === "undefined" ? Date.now() : performance.now())

/** The seconds to show: the given duration, else the measured one, at least 1. */
const secondsOf = (state: Pick<ReasoningState, "duration" | "measured">) => {
  const seconds = state.duration ?? state.measured
  return seconds === undefined ? undefined : Math.max(1, Math.round(seconds))
}

const reasoning = definePrimitive({
  name: "reasoning",
  options: { streaming: "boolean", duration: "number" },
  state: (options: ReasoningOptions): ReasoningState => ({
    streaming: options.streaming ?? false,
    duration: options.duration,
    measured: undefined,
    content: "",
  }),
  sync: (options) => ({ streaming: options.streaming ?? false, duration: options.duration }),
  controlled: ["content"],
  api: (context) => {
    let started = context.options().streaming ? now() : undefined
    let streaming = Boolean(context.options().streaming)
    context.onOptions((options) => {
      const next = Boolean(options.streaming)
      if (next === streaming) return
      streaming = next
      if (next) {
        started = now()
        context.store.set({ measured: undefined })
        return
      }
      const measured = started === undefined ? undefined : (now() - started) / 1000
      started = undefined
      context.store.set({ measured })
      const seconds = secondsOf({ duration: options.duration, measured })
      announce(seconds === undefined ? "Finished thinking" : `Thought for ${seconds} second${seconds === 1 ? "" : "s"}`)
    })
    return {
      /** The seconds to show once it has finished, or undefined when they are unknown. */
      seconds: (state: ReasoningState) => secondsOf(state),
    }
  },
  slots: (slot) => ({
    root: slot<{}, { streaming: boolean; seconds: number | undefined }>({
      state: (state, part) => ({ streaming: state.streaming, seconds: part.api.seconds(state) }),
      attrs: (state) => ({ "data-streaming": state.streaming ? "" : undefined }),
      /* An agent reads the label, and the thinking while it is open. */
      bind: (el, part) => bindAgentContent(el, (content) => part.store.set({ content })),
    }),
    /* The trigger's words: "Thinking…" or "Thought for 12s". */
    label: slot<{}, { streaming: boolean; seconds: number | undefined }>({
      state: (state, part) => ({ streaming: state.streaming, seconds: part.api.seconds(state) }),
      attrs: (state) => ({ "data-streaming": state.streaming ? "" : undefined }),
    }),
  }),
  agent: { actions: [] },
})

export { reasoning, type ReasoningOptions, type ReasoningState }
