/* A tool call: one call an AI agent made to a tool, shown as a card, as a UI SDK primitive. UI SDK
   ships none, so it is defined with its core: the same definition renders in React, Vue, Svelte,
   Solid and web components.

   The card has a header (the status mark, a human title, the tool's name, the time it took) and a
   body with the call's input and its output or error. The body opens and closes with UI SDK's
   collapsible, composed in the renderer and controlled from this primitive's `open`. To an agent the
   card reads as the tool's name, status, open state and short summaries of the input and output;
   it opens the card with the collapsible's own `setOpen`. A call that fails opens on its own
   (`openOnError`, on by default). When a call finishes or fails, screen readers hear its title
   and the new status once. */

import { announce, createChange, definePrimitive, type ChangeDetails } from "@ui-sdk/core"

/** Where the call is. `"approval"` waits for a person; `"denied"` is a call a person refused. */
type ToolCallStatus = "pending" | "running" | "approval" | "done" | "error" | "denied"

type ToolCallOpenReason = "trigger-press" | "status-error" | "imperative"

const statuses: ToolCallStatus[] = ["pending", "running", "approval", "done", "error", "denied"]
const statusOf = (status: unknown): ToolCallStatus => (statuses.includes(status as ToolCallStatus) ? (status as ToolCallStatus) : "done")

/** The words each status is read with, for screen readers and agents. */
const statusLabels: Record<ToolCallStatus, string> = {
  pending: "Queued",
  running: "Running",
  approval: "Needs approval",
  done: "Done",
  error: "Failed",
  denied: "Denied",
}

/* ------------------------------------------------------------------ serialising */

/** Pretty JSON for a tool's input or output. Strings stay as they are; cycles, functions and
    bigints never throw. */
function serialize(value: unknown): string {
  if (value === undefined) return ""
  if (typeof value === "string") return value
  const seen = new WeakSet<object>()
  try {
    return (
      JSON.stringify(
        value,
        (_key, next: unknown) => {
          if (typeof next === "bigint") return `${next}n`
          if (typeof next === "function") return `[function ${next.name || "anonymous"}]`
          if (next instanceof Error) return { name: next.name, message: next.message }
          if (next && typeof next === "object") {
            if (seen.has(next)) return "[circular]"
            seen.add(next)
          }
          return next
        },
        2,
      ) ?? String(value)
    )
  } catch {
    return String(value)
  }
}

/** One line, at most `max` characters, for an agent's snapshot or a collapsed preview. */
function summarize(value: unknown, max = 160): string {
  if (value === undefined || value === null || value === "") return ""
  let line: string
  if (typeof value === "string") line = value
  else {
    try {
      line = JSON.stringify(value, (_k, next: unknown) => (typeof next === "bigint" ? `${next}n` : next)) ?? String(value)
    } catch {
      line = serialize(value)
    }
  }
  line = line.replace(/\s+/g, " ").trim()
  return line.length > max ? `${line.slice(0, max - 1)}…` : line
}

/** "420ms", "2.4s", "1m 12s". */
function formatDuration(ms: number | undefined): string {
  if (ms === undefined || !Number.isFinite(ms) || ms < 0) return ""
  if (ms < 1000) return `${Math.round(ms)}ms`
  if (ms < 60_000) return `${(ms / 1000).toFixed(ms < 10_000 ? 1 : 0)}s`
  const minutes = Math.floor(ms / 60_000)
  return `${minutes}m ${Math.round((ms % 60_000) / 1000)}s`
}

/* ------------------------------------------------------------------ the primitive */

type ToolCallOptions = {
  /** The tool's name, like `"search_orders"`. */
  name?: string
  /** A short human title, like "Looking up order #1048". It names the card. */
  title?: string
  /** Where the call is. @defaultValue "done" */
  status?: ToolCallStatus
  /** The call's arguments. Any value: objects are shown as pretty JSON. */
  input?: unknown
  /** What the tool returned. */
  output?: unknown
  /** Why it failed, with `status="error"`. */
  error?: string
  /** How long it took, in milliseconds. */
  duration?: number
  /** Whether the body is open. Set it to control the card yourself. */
  open?: boolean
  /** Whether the body starts open, when you don't control it. A failed call starts open. */
  defaultOpen?: boolean
  /** Runs when the body opens or closes; `details.reason` is `"status-error"` when a failure opened it. */
  onOpenChange?: (open: boolean, details: ChangeDetails<ToolCallOpenReason>) => void
  /** Open the body on its own when the call fails. @defaultValue true */
  openOnError?: boolean
}

type ToolCallState = {
  name: string
  title: string
  status: ToolCallStatus
  open: boolean
  /** One-line summaries, for agents. The renderer shows the full value. */
  input: string
  output: string
  error: string
  duration: string
  openOnError: boolean
}

const fromOptions = (options: ToolCallOptions) => ({
  name: options.name ?? "",
  title: options.title ?? "",
  status: statusOf(options.status),
  input: summarize(options.input),
  output: summarize(options.output),
  error: options.error ?? "",
  duration: formatDuration(options.duration),
  openOnError: options.openOnError !== false,
})

const toolCall = definePrimitive({
  name: "tool-call",
  options: {
    name: "string",
    title: "string",
    status: "string",
    input: "value",
    output: "value",
    error: "string",
    duration: "number",
    open: "boolean",
    defaultOpen: "boolean",
    onOpenChange: "callback",
    openOnError: "boolean",
  },
  state: (options: ToolCallOptions): ToolCallState => ({
    ...fromOptions(options),
    open: options.open ?? options.defaultOpen ?? (statusOf(options.status) === "error" && options.openOnError !== false),
  }),
  sync: (options) => ({ ...fromOptions(options), ...(options.open === undefined ? {} : { open: options.open }) }),
  controlled: ["open", "name", "status", "input", "output", "error", "duration"],
  api: (context) => {
    const change = createChange(context)
    return {
      /** Opens or closes the body. */
      setOpen(open: boolean, event?: Event, reason: ToolCallOpenReason = "imperative") {
        if (context.store.get().open === open) return
        change("open", open, { reason, event })
      },
      toggle(event?: Event) {
        change("open", !context.store.get().open, { reason: "trigger-press", event })
      },
    }
  },
  slots: (slot) => ({
    root: slot<{}, { status: ToolCallStatus; open: boolean }>({
      state: (state) => ({ status: state.status, open: state.open }),
      attrs: (state, part) => ({
        "data-status": state.status,
        "data-open": state.open ? "" : undefined,
        "aria-labelledby": `${part.id}-title`,
        "aria-busy": state.status === "running" ? "true" : undefined,
      }),
      /* A failure opens the body (after the render that set it, so the change is a real one the
         app hears), and the end of a call is read out once. */
      bind: (_el, part) => {
        let was = part.store.get().status
        return part.store.subscribe(() => {
          const { status, title, name, openOnError } = part.store.get()
          if (status === was) return
          const before = was
          was = status
          if (status === "error" && openOnError) part.api.setOpen(true, undefined, "status-error")
          const ended = (before === "running" || before === "approval") && status !== "running"
          if (ended) announce(`${title || name}: ${statusLabels[status]}`, { priority: status === "error" ? "assertive" : "polite" })
        })
      },
    }),
    /* Decorative: the status is also said in words, in the status part. */
    icon: slot({ attrs: () => ({ "aria-hidden": "true" }) }),
    title: slot({ attrs: (_state, part) => ({ id: `${part.id}-title` }) }),
    name: slot({ attrs: () => ({ translate: "no" }) }),
    status: slot<{}, { status: ToolCallStatus }>({
      state: (state) => ({ status: state.status }),
      attrs: (state) => ({ "data-status": state.status }),
    }),
    duration: slot({}),
    /* "Input", "Output" or "Error", and its value. */
    section: slot<{ kind?: string }, { kind: string }>({
      props: { kind: "string" },
      state: (_state, part) => ({ kind: part.props.kind ?? "input" }),
      attrs: (_state, part) => ({ "data-kind": part.props.kind ?? "input" }),
    }),
    /* "Input", "Output" or "Error". Not named `label`: UI SDK would take it as the card's name. */
    caption: slot({}),
  }),
  /* An agent reads the name, status, open state and the summaries. It opens the card through the
     body's own collapsible (its `setOpen`), which hands the change back here: one action, on one
     component, so a step that names the call by its title is never ambiguous. */
  agent: { actions: [] },
})

export { formatDuration, serialize, statusLabels, summarize, toolCall, type ToolCallOptions, type ToolCallStatus }
