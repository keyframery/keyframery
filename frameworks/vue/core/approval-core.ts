/* Approval: a person says yes or no to something an AI agent wants to do, as a UI SDK primitive.
   UI SDK ships none, so it is defined with its core: the same definition renders in React, Vue,
   Svelte, Solid and web components.

   The card shows what the agent wants to do (a title, the control it would use, details, a risk
   level) with Approve and Deny. Once answered it collapses to one line. The buttons, the "Always
   allow" choice and the reason field are composed by the renderer (UI SDK's button, checkbox and
   textarea) and sit inside the `actions` part, wrapped in `data-agent-hidden`: the agent bridge
   leaves everything in it out of `snapshot` and `query`, and a step that names one of them fails
   with "isn't available to agents here. Ask the person." An agent can read the card (so it knows
   it is waiting), never answer it. The primitive also declares no agent actions, so its own
   `approve` and `deny` are never offered.

   `createApprovals()` connects cards to UI SDK's agent bridge: pass its `allow` to `createAgent`
   or `registerTools`, render a card for each request, and the bridge waits for the person. */

import { announce, createChange, definePrimitive, type ChangeDetails } from "@ui-sdk/core"
import type { AgentAction } from "@ui-sdk/core/agent"
import { elementOf } from "@ui-sdk/core/observe"

import { bindAgentContent } from "@/components/keyframery/core/agent-content-core"

type ApprovalStatus = "pending" | "approved" | "denied"
type ApprovalRisk = "low" | "medium" | "high"
type ApprovalReason = "approve-press" | "deny-press" | "imperative"

const risks: ApprovalRisk[] = ["low", "medium", "high"]
const riskOf = (risk: unknown): ApprovalRisk => (risks.includes(risk as ApprovalRisk) ? (risk as ApprovalRisk) : "medium")
const statusOf = (status: unknown): ApprovalStatus => (status === "approved" || status === "denied" ? status : "pending")

type ApprovalOptions = {
  /** Whether it waits or was answered. Set it to control the card yourself. */
  status?: ApprovalStatus
  /** Where an uncontrolled card starts. @defaultValue "pending" */
  defaultStatus?: ApprovalStatus
  /** Runs when the person answers; cancel to keep it pending. */
  onStatusChange?: (status: ApprovalStatus, details: ChangeDetails<ApprovalReason>) => void
  /** How much is at stake: changes the accent and which button takes focus. @defaultValue "medium" */
  risk?: ApprovalRisk
  /** The person approved. `always` is true when they ticked "Always allow this action". */
  onApprove?: (details: { always: boolean }) => void
  /** The person denied, with the reason they gave, if any. */
  onDeny?: (reason: string | undefined) => void
  /** Ask for an optional reason before denying. */
  askReason?: boolean
  /** When it was answered (epoch ms), for "Approved · 2s ago". Set from the answer when left out. */
  resolvedAt?: number
}

type ApprovalState = {
  status: ApprovalStatus
  risk: ApprovalRisk
  /** "ask" shows Approve and Deny; "reason" shows the reason field before denying. */
  stage: "ask" | "reason"
  always: boolean
  reason: string
  askReason: boolean
  resolvedAt: number | undefined
  /** The card's readable text, for agents. The actions are left out. */
  content: string
}

const approval = definePrimitive({
  name: "approval",
  options: {
    status: "string",
    defaultStatus: "string",
    onStatusChange: "callback",
    risk: "string",
    onApprove: "callback",
    onDeny: "callback",
    askReason: "boolean",
    resolvedAt: "number",
  },
  state: (options: ApprovalOptions): ApprovalState => ({
    status: statusOf(options.status ?? options.defaultStatus),
    risk: riskOf(options.risk),
    stage: "ask",
    always: false,
    reason: "",
    askReason: options.askReason ?? false,
    resolvedAt: options.resolvedAt,
    content: "",
  }),
  sync: (options) => ({
    risk: riskOf(options.risk),
    askReason: options.askReason ?? false,
    ...(options.status === undefined ? {} : { status: statusOf(options.status) }),
    ...(options.resolvedAt === undefined ? {} : { resolvedAt: options.resolvedAt }),
  }),
  controlled: ["status", "risk", "content"],
  api: (context) => {
    const change = createChange(context)
    const settle = (status: ApprovalStatus, reason: ApprovalReason, event?: Event) => {
      if (context.store.get().status !== "pending") return false
      if (!change("status", status, { reason, event })) return false
      if (context.options().resolvedAt === undefined) context.store.set({ resolvedAt: Date.now() })
      context.store.set({ stage: "ask" })
      return true
    }
    const deny = (reason?: string, event?: Event) => {
      const given = (reason ?? context.store.get().reason).trim() || undefined
      if (settle("denied", "deny-press", event)) context.options().onDeny?.(given)
    }
    return {
      /** The person approves. */
      approve(event?: Event) {
        const { always } = context.store.get()
        if (settle("approved", "approve-press", event)) context.options().onApprove?.({ always })
      },
      /** The person denies; `reason` is optional. */
      deny,
      /** Deny pressed: with `askReason`, the first press asks why, the second denies. */
      pressDeny(event?: Event) {
        const { askReason, stage } = context.store.get()
        if (askReason && stage === "ask") context.store.set({ stage: "reason" })
        else deny(undefined, event)
      },
      /** Back from the reason field to Approve and Deny. */
      back() {
        context.store.set({ stage: "ask", reason: "" })
      },
      setAlways(always: boolean) {
        context.store.set({ always })
      },
      setReason(reason: string) {
        context.store.set({ reason })
      },
    }
  },
  slots: (slot) => ({
    root: slot<{}, { status: ApprovalStatus; risk: ApprovalRisk; stage: "ask" | "reason" }>({
      state: (state) => ({ status: state.status, risk: state.risk, stage: state.stage }),
      attrs: (state, part) => ({
        role: "group",
        "data-status": state.status,
        "data-risk": state.risk,
        "data-stage": state.stage,
        "data-resolved": state.status === "pending" ? undefined : "",
        "aria-labelledby": `${part.id}-title`,
        "aria-describedby": `${part.id}-description`,
      }),
      /* Readable for agents (the actions are hidden from them), and the answer is read out once. */
      bind: (el, part) => {
        const stopContent = bindAgentContent(el, (content) => part.store.set({ content }))
        let was = part.store.get().status
        const stop = part.store.subscribe(() => {
          const { status } = part.store.get()
          if (status === was) return
          was = status
          if (status !== "pending") announce(status === "approved" ? "Approved" : "Denied")
        })
        return () => {
          stopContent()
          stop()
        }
      },
    }),
    /* Decorative: the risk is also said in words. */
    icon: slot({ attrs: () => ({ "aria-hidden": "true" }) }),
    title: slot({ attrs: (_state, part) => ({ id: `${part.id}-title` }) }),
    description: slot({ attrs: (_state, part) => ({ id: `${part.id}-description` }) }),
    /* The control the agent would use, like "Press “Delete order #1048”". */
    target: slot({}),
    risk: slot<{}, { risk: ApprovalRisk }>({
      state: (state) => ({ risk: state.risk }),
      attrs: (state) => ({ "data-risk": state.risk }),
    }),
    details: slot({}),
    /* Everything that closes once the card is answered. Inert then, so nothing in it takes focus. */
    body: slot<{}, { status: ApprovalStatus }>({
      state: (state) => ({ status: state.status }),
      attrs: (state) => ({
        "data-resolved": state.status === "pending" ? undefined : "",
        inert: state.status === "pending" ? undefined : "",
        "aria-hidden": state.status === "pending" ? undefined : "true",
      }),
    }),
    /* The person's controls. The renderer puts them inside an element marked `data-agent-hidden`,
       so agents never see or press them: an agent approving its own request would defeat the
       point. (The mark goes inside this part, not on it: UI SDK treats a component with any part
       under `data-agent-hidden` as hidden as a whole, and the card itself should stay readable.) */
    actions: slot<{}, { stage: "ask" | "reason"; risk: ApprovalRisk; always: boolean; reason: string; status: ApprovalStatus }>({
      state: (state) => ({ stage: state.stage, risk: state.risk, always: state.always, reason: state.reason, status: state.status }),
      attrs: (state) => ({ "data-stage": state.stage }),
    }),
    /* The one-line answer, once there is one. */
    summary: slot<{}, { status: ApprovalStatus; resolvedAt: number | undefined }>({
      present: (state) => state.status !== "pending",
      state: (state) => ({ status: state.status, resolvedAt: state.resolvedAt }),
      attrs: (state) => ({ "data-status": state.status }),
    }),
  }),
  /* Readable, never operable: no actions, and the actions part is `data-agent-hidden`. */
  agent: { actions: [] },
})

/* ------------------------------------------------------------------ createApprovals */

/** What UI SDK's bridge passes to `allow` (`createAgent({ allow })`, `registerTools(agent, { allow })`). */
type Allow = (step: AgentAction, context: { signal: AbortSignal }) => boolean | Promise<boolean>

/** One thing an agent asked to do that waits, or waited, for a person. */
type ApprovalRequest = {
  id: string
  /** The step as the bridge resolved it: `component`, `label`, `action`, `args`, `confirm`. */
  step: AgentAction
  title: string
  description?: string
  /** The control the agent would use, like "Press “Refund order #1048”". */
  target: string
  risk: ApprovalRisk
  status: ApprovalStatus
  /** Why it was denied: the person's reason, or "Cancelled" when the agent stopped waiting. */
  reason?: string
  createdAt: number
  resolvedAt?: number
  /** Answer it. `always` lets the same action on the same control through from now on. */
  approve: (options?: { always?: boolean }) => void
  deny: (reason?: string) => void
}

type ApprovalsOptions = {
  /** Which steps wait for a person. Default: the ones on a control marked `data-agent-confirm`. */
  needs?: (step: AgentAction) => boolean
  /** Your words for a request. Anything left out is made from the step. */
  describe?: (step: AgentAction) => Partial<Pick<ApprovalRequest, "title" | "description" | "target" | "risk">>
  /** How many answered requests `requests()` keeps, newest last. @defaultValue 20 */
  keep?: number
}

const quote = (value: unknown) => `“${String(value)}”`

/** "Press “Refund order #1048”", "Set Region to “Europe”", "Open Shipping". */
function describeTarget(step: AgentAction): string {
  const name = step.label ?? step.component
  const [first] = step.args
  if (step.action === "press") return `Press ${quote(first ?? name)}`
  if (step.action === "setValue") return first === undefined ? `Clear ${name}` : `Set ${name} to ${quote(Array.isArray(first) ? first.join(", ") : first)}`
  if (step.action === "setOpen") return `${first === false ? "Close" : "Open"} ${name}`
  if (step.action === "setChecked") return `${first === false ? "Uncheck" : "Check"} ${name}`
  const verb = step.action.replace(/([A-Z])/g, " $1").toLowerCase()
  return `${verb.charAt(0).toUpperCase()}${verb.slice(1)} ${name}`
}

/* A step aimed at an approval card is refused outright, whatever else allows it. */
function targetsApproval(step: AgentAction) {
  try {
    return !!elementOf(step.ref)?.closest('[data-slot="approval"]')
  } catch {
    return false
  }
}

/**
 * Approval requests for UI SDK's agent bridge. Pass `allow` to `createAgent` or `registerTools`;
 * each step that needs a person becomes a request in `pending()`, and the bridge waits until it is
 * approved, denied, or the step's signal aborts (the agent's turn was stopped, or it timed out),
 * which denies it.
 *
 * @example
 * const approvals = createApprovals()
 * const agent = createAgent({ allow: approvals.allow })
 * registerTools(agent, { allow: approvals.allow })
 * const requests = useSyncExternalStore(approvals.subscribe, approvals.requests)
 * requests.map((request) => <Approval key={request.id} request={request} />)
 */
function createApprovals(options: ApprovalsOptions = {}) {
  const { needs = (step) => step.confirm !== undefined, describe, keep = 20 } = options
  const listeners = new Set<() => void>()
  const always = new Set<string>()
  const answers = new Map<string, (yes: boolean) => void>()
  let all: ApprovalRequest[] = []
  let waiting: ApprovalRequest[] = []
  let next = 1

  const keyOf = (step: AgentAction) => [step.component, step.label ?? step.ref, step.action, step.confirm ?? ""].join("\u0000")

  const emit = () => {
    waiting = all.filter((request) => request.status === "pending")
    listeners.forEach((listener) => listener())
  }

  const resolve = (id: string, status: Exclude<ApprovalStatus, "pending">, extra: { reason?: string; always?: boolean } = {}) => {
    const at = all.findIndex((request) => request.id === id)
    const request = all[at]
    if (!request || request.status !== "pending") return
    if (status === "approved" && extra.always) always.add(keyOf(request.step))
    all = all.slice()
    all[at] = { ...request, status, reason: extra.reason, resolvedAt: Date.now() }
    /* Drop the oldest answered requests beyond `keep`. */
    const answered = all.filter((item) => item.status !== "pending")
    if (answered.length > keep) {
      const drop = new Set(answered.slice(0, answered.length - keep).map((item) => item.id))
      all = all.filter((item) => !drop.has(item.id))
    }
    const answer = answers.get(id)
    answers.delete(id)
    emit()
    answer?.(status === "approved")
  }

  const allow: Allow = (step, { signal }) => {
    if (targetsApproval(step)) return false
    if (!needs(step)) return true
    if (always.has(keyOf(step))) return true
    if (signal.aborted) return false
    const id = `approval-${next++}`
    const own = describe?.(step) ?? {}
    const target = own.target ?? describeTarget(step)
    const request: ApprovalRequest = {
      id,
      step,
      title: own.title ?? step.confirm ?? target,
      description: own.description,
      target,
      risk: own.risk ?? (step.confirm !== undefined ? "high" : step.action === "press" ? "medium" : "low"),
      status: "pending",
      createdAt: Date.now(),
      approve: (answer) => resolve(id, "approved", { always: answer?.always }),
      deny: (reason) => resolve(id, "denied", { reason: reason?.trim() || undefined }),
    }
    return new Promise<boolean>((done) => {
      answers.set(id, done)
      signal.addEventListener("abort", () => resolve(id, "denied", { reason: "Cancelled" }), { once: true })
      all = [...all, request]
      emit()
    })
  }

  return {
    /** UI SDK's `allow`: `(step, { signal }) => boolean | Promise<boolean>`. */
    allow,
    /** The requests waiting for a person. The same array until something changes. */
    pending: () => waiting,
    /** Waiting and recently answered requests, oldest first, so answered cards can stay as a record. */
    requests: () => all,
    /** Calls `listener` whenever a request arrives or is answered. Returns the unsubscribe. */
    subscribe(listener: () => void) {
      listeners.add(listener)
      return () => void listeners.delete(listener)
    },
    approve: (id: string, answer?: { always?: boolean }) => resolve(id, "approved", { always: answer?.always }),
    deny: (id: string, reason?: string) => resolve(id, "denied", { reason: reason?.trim() || undefined }),
    /** Forget answered requests and every "Always allow". Waiting ones stay. */
    reset() {
      always.clear()
      all = all.filter((request) => request.status === "pending")
      emit()
    },
  }
}

type Approvals = ReturnType<typeof createApprovals>

export {
  approval,
  createApprovals,
  describeTarget,
  type Allow,
  type ApprovalOptions,
  type ApprovalRequest,
  type ApprovalRisk,
  type Approvals,
  type ApprovalsOptions,
  type ApprovalStatus,
}
