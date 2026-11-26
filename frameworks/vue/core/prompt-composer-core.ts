/* The input box of an AI chat, as a UI SDK primitive. UI SDK ships no composer, so its root is
   defined with its core: the same definition renders in React, Vue, Svelte, Solid and web components.
   The text field is UI SDK's textarea (with a trigger menu for @ and /), the files are UI SDK's file
   input, the buttons are UI SDK buttons; this primitive adds what ties them together:

   - The keys. Enter sends and Shift+Enter starts a line (`submitOn: "enter"`), or Enter starts a
     line and Cmd/Ctrl+Enter sends (`submitOn: "mod+enter"`). Cmd/Ctrl+Enter always sends. Nothing
     sends while an input method is composing, and a key a part inside already used (the trigger
     menu choosing a suggestion with Enter) is left alone.
   - The state the look follows: `data-status` ("ready", "submitted", "streaming", "error"),
     `data-empty` while there is nothing to send, `data-disabled`.
   - The agent: it can `submit` what is in the box and `stop` a reply. Screen readers hear when a
     reply starts and stops, since the Send button changing into Stop is easy to miss. */

import { announce, definePrimitive, isComposing } from "@ui-sdk/core"

type PromptComposerStatus = "ready" | "submitted" | "streaming" | "error"

type PromptComposerSubmitOn = "enter" | "mod+enter"

type PromptComposerOptions = {
  /** Where the conversation is: `"ready"`, `"submitted"` (sent, waiting for the reply), `"streaming"` (the reply is coming in) or `"error"`. */
  status?: PromptComposerStatus
  /** Which key sends: `"enter"` (Shift+Enter for a new line) or `"mod+enter"` (Enter for a new line). Cmd/Ctrl+Enter always sends. */
  submitOn?: PromptComposerSubmitOn
  /** Nothing to send: no text and no files. */
  empty?: boolean
  /** Turns the whole composer off. */
  disabled?: boolean
  /** Asked to send: a key, the agent, or `submit()`. */
  onSubmit?: (details: { event?: Event }) => void
  /** Asked to stop the reply. */
  onStop?: (details: { event?: Event }) => void
}

type PromptComposerState = {
  status: PromptComposerStatus
  empty: boolean
  disabled: boolean
}

const statusOf = (status: string | undefined): PromptComposerStatus =>
  status === "submitted" || status === "streaming" || status === "error" ? status : "ready"

/* Enter pressed while a suggestion list was open at the caret belongs to that list, even when the
   list has closed by the time the key reaches the root (it chose an item). Noted on the way down. */
const menuKeys = new WeakSet<Event>()
const listOpen = (target: EventTarget | null) =>
  target instanceof HTMLElement && (target.hasAttribute("data-open") || target.getAttribute("aria-expanded") === "true")

const busy = (status: PromptComposerStatus) => status === "submitted" || status === "streaming"

const isApple = () => typeof navigator !== "undefined" && /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent)

const promptComposer = definePrimitive({
  name: "prompt-composer",
  options: {
    status: "string",
    submitOn: "string",
    empty: "boolean",
    disabled: "boolean",
    onSubmit: "callback",
    onStop: "callback",
  },
  state: (options: PromptComposerOptions): PromptComposerState => ({
    status: statusOf(options.status),
    empty: options.empty ?? true,
    disabled: options.disabled ?? false,
  }),
  sync: (options) => ({
    status: statusOf(options.status),
    empty: options.empty ?? true,
    disabled: options.disabled ?? false,
  }),
  controlled: ["status", "empty"],
  api: (context) => {
    const canSubmit = () => {
      const { status, empty, disabled } = context.store.get()
      return !disabled && !empty && !busy(status)
    }
    return {
      /** Sends what is in the composer, unless it is empty, disabled or a reply is on its way. */
      submit(event?: Event) {
        if (!canSubmit()) return false
        context.options().onSubmit?.({ event })
        return true
      },
      /** Stops the reply that is on its way. */
      stop(event?: Event) {
        const { status, disabled } = context.store.get()
        if (disabled || !busy(status)) return false
        context.options().onStop?.({ event })
        return true
      },
      internal: {
        /* Enter, from the field inside. A part that used the key already prevented it. */
        keydown(event: KeyboardEvent, submit: (event?: Event) => boolean) {
          if (event.key !== "Enter" || event.defaultPrevented || menuKeys.has(event)) return
          if (isComposing(event) || event.keyCode === 229) return
          if (!(event.target instanceof HTMLTextAreaElement)) return
          const mod = isApple() ? event.metaKey : event.ctrlKey
          const submitOn = context.options().submitOn === "mod+enter" ? "mod+enter" : "enter"
          const sends = mod ? !event.shiftKey : submitOn === "enter" && !event.shiftKey && !event.altKey && !event.ctrlKey && !event.metaKey
          if (!sends) return
          /* The send key never adds a line, even when there is nothing to send yet. */
          event.preventDefault()
          submit(event)
        },
      },
    }
  },
  slots: (slot) => ({
    root: slot<{}, PromptComposerState>({
      role: "group",
      state: (state) => ({ ...state }),
      attrs: (state) => ({
        "data-status": state.status,
        "data-empty": state.empty ? "" : undefined,
        "data-disabled": state.disabled ? "" : undefined,
        "aria-busy": busy(state.status) ? "true" : undefined,
      }),
      on: { keydown: (event, { api }) => api.internal.keydown(event as KeyboardEvent, api.submit) },
      /* Says when a reply starts or fails, and notes keys meant for an open suggestion list. */
      bind: (el) => {
        const noteMenuKey = (event: KeyboardEvent) => {
          if (event.key === "Enter" && listOpen(event.target)) menuKeys.add(event)
        }
        el.addEventListener("keydown", noteMenuKey, true)
        let was = el.getAttribute("data-status")
        const observer = new MutationObserver(() => {
          const now = el.getAttribute("data-status")
          if (now === was) return
          const before = was
          was = now
          if (now === "streaming" && before !== "streaming") announce(el.getAttribute("data-announce-streaming") ?? "Replying", { priority: "polite" })
          if (now === "error") announce(el.getAttribute("data-announce-error") ?? "The reply failed", { priority: "assertive" })
        })
        observer.observe(el, { attributes: true, attributeFilter: ["data-status"] })
        return () => {
          observer.disconnect()
          el.removeEventListener("keydown", noteMenuKey, true)
        }
      },
    }),
    /* The files above the text. It holds attachments, which name themselves. */
    attachments: slot({}),
    /* The row of actions along the foot: attach, the model, your own, the count and Send. */
    toolbar: slot({}),
    /* What shows over the box while files are dragged over it. Decorative: the drop zone is announced by the file input. */
    drop: slot({
      attrs: () => ({ "aria-hidden": "true" }),
    }),
    /* The length of the message, beside Send. `near` and `over` the limit show as data attributes. */
    count: slot<{ near?: boolean; over?: boolean }>({
      props: { near: "boolean", over: "boolean" },
      attrs: (_state, part) => ({
        "data-near": part.props.near ? "" : undefined,
        "data-over": part.props.over ? "" : undefined,
        "aria-live": part.props.near || part.props.over ? "polite" : undefined,
      }),
    }),
  }),
  agent: { actions: ["submit", "stop"] },
})

export { promptComposer, type PromptComposerOptions, type PromptComposerStatus, type PromptComposerSubmitOn }
