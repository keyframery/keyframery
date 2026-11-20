/* UI SDK's agent bridge, switched on for the admin.

   Every Keyframery control in Backroom is a UI SDK component, so an AI agent can read the page
   (`snapshot`), find things in it (`query`) and use it (`act`): change the dashboard's period,
   open an order, fill a form. Reading and ordinary actions are allowed. A control marked with
   `data-agent-confirm="…"` (refund, cancel, delete, remove a member, sign out) waits for the
   person signed in to say yes in a dialog (see AgentConfirm in shell.tsx) before it runs.

   In browsers with WebMCP the same three tools are registered with the browser's own agent.
   `window.__kfAgent` is the bridge, for the console and for Keyframery's checkers. */

import { createAgent, registerTools } from "@ui-sdk/react/agent"

type Ask = { id: number; text: string; resolve: (yes: boolean) => void; signal: AbortSignal }

/* ------------------------------------------------------------------ asking the person */

let pending: Ask | null = null
let nextId = 1
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((listener) => listener())

/** The question waiting for the person, if any. */
export const currentAsk = () => pending
export function subscribeAsk(listener: () => void) {
  listeners.add(listener)
  return () => void listeners.delete(listener)
}

/** Shows `text` to the person and resolves with their answer. A newer question replaces an older one, which answers no. */
export function askPerson(text: string, signal: AbortSignal): Promise<boolean> {
  return new Promise((resolve) => {
    pending?.resolve(false)
    const ask: Ask = {
      id: nextId++,
      text,
      signal,
      resolve: (yes) => {
        if (pending?.id === ask.id) pending = null
        resolve(yes)
        emit()
      },
    }
    signal.addEventListener("abort", () => ask.resolve(false), { once: true })
    pending = ask
    emit()
  })
}

/* ------------------------------------------------------------------ the bridge */

type Agent = ReturnType<typeof createAgent>

type Allow = NonNullable<NonNullable<Parameters<typeof createAgent>[0]>["allow"]>

const allow: Allow = (step, { signal }) => (step.confirm ? askPerson(step.confirm, signal) : true)
const policy: Parameters<typeof createAgent>[0] = { allow }

declare global {
  interface Window {
    __kfAgent?: Agent
  }
}

let agent: Agent | null = null
let unregister: (() => void) | null = null

/** Creates the bridge once, in the browser, before the admin renders its components. */
export function startAgent(): Agent | null {
  if (typeof window === "undefined") return null
  agent ??= createAgent(policy)
  window.__kfAgent = agent
  /* The browser's agent goes through the same policy: a marked control still asks the person. */
  unregister ??= registerTools(agent, { allow })
  return agent
}

export function stopAgent() {
  unregister?.()
  unregister = null
}
