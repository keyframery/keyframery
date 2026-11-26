"use client"

/* Animated approval card, on UI SDK's core. UI SDK ships no approval, so its parts are defined in
   `@/components/core/approval` with `definePrimitive` and rendered here. This file adds motion only.
   Colours, radii and spacing stay yours (style `data-risk` and `data-status`).

   Feedback (runs at any --kf-flourish):
   - Fade: the card fades in with a small rise when a request arrives.
   - Height: once answered, the body (details and buttons) closes to its header, so the card
     becomes one line; the reason field opens and closes the same way.
   - Fade: the answer ("Approved · 2s ago") fades in where the risk was.
   Flourish (scaled by --kf-flourish, gone at 0):
   - Rise and blur on arrival beyond the small feedback rise.
   - Draw and Pop: the answer's tick or cross pops in and draws itself.
   - Direction: the answer rises into place.

   `createApprovals()` (re-exported) connects the card to UI SDK's agent bridge; see the core file. */

import type { StateOf } from "@ui-sdk/core"
import { type PartProps, usePart, usePrimitive, type PrimitiveHandle } from "@ui-sdk/react/primitive"
import * as React from "react"

import { approval, type ApprovalOptions } from "@/components/core/approval"
import { cn } from "@/lib/utils"

type ClassName<S> = string | ((state: S) => string | undefined) | undefined
function withClass<S>(base: string, className: ClassName<S>) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

const keyframes = [
  "@keyframes kf-approval-in{from{opacity:0;translate:0 calc(4px + 8px*var(--kf-flourish,1));scale:calc(0.985 - 0.015*var(--kf-flourish,1));filter:blur(calc(4px*var(--kf-flourish,1)))}}",
  "@keyframes kf-approval-answer{from{opacity:0;translate:0 calc(6px*var(--kf-flourish,1));filter:blur(calc(3px*var(--kf-flourish,1)))}}",
  "@keyframes kf-approval-draw{from{stroke-dashoffset:1}}",
  "@keyframes kf-approval-pop{from{scale:calc(1 - 0.6*var(--kf-flourish,1));opacity:0}}",
].join("")

/* The instance, for the controls the renderer composes (UI SDK's button, checkbox and textarea),
   which hand the person's answer back to it. */
const HandleContext = React.createContext<PrimitiveHandle<typeof approval> | null>(null)
/** The approval around this part: its `state` and `api` (`approve`, `deny`, `pressDeny`, `back`,
    `setAlways`, `setReason`). */
function useApproval() {
  const handle = React.use(HandleContext)
  if (!handle) throw new Error("Approval parts must be inside <Approval>.")
  return handle
}

type RootProps = ApprovalOptions & PartProps<"div", StateOf<typeof approval, "root">>

/* Arrives with a fade and a small rise; the rise and blur beyond that are flourish. */
function Approval({ status, defaultStatus, onStatusChange, risk, onApprove, onDeny, askReason, resolvedAt, className, ...props }: RootProps) {
  const handle = usePrimitive(approval, { status, defaultStatus, onStatusChange, risk, onApprove, onDeny, askReason, resolvedAt })
  const root = usePart(
    handle,
    "root",
    {},
    {
      ...props,
      className: withClass(
        "group/approval animate-[kf-approval-in_calc(420ms*var(--kf-speed,1))_var(--ease-spring)_backwards] motion-reduce:animate-none",
        className,
      ),
    },
    "div",
  )
  return (
    <HandleContext value={handle}>
      <style href="kf-approval" precedence="default">
        {keyframes}
      </style>
      {root}
    </HandleContext>
  )
}

function ApprovalIcon(props: PartProps<"span", StateOf<typeof approval, "icon">>) {
  return usePart(approval, "icon", {}, props, "span")
}
function ApprovalTitle(props: PartProps<"div", StateOf<typeof approval, "title">>) {
  return usePart(approval, "title", {}, props, "div")
}
function ApprovalDescription(props: PartProps<"p", StateOf<typeof approval, "description">>) {
  return usePart(approval, "description", {}, props, "p")
}
function ApprovalTarget(props: PartProps<"div", StateOf<typeof approval, "target">>) {
  return usePart(approval, "target", {}, props, "div")
}
function ApprovalDetails(props: PartProps<"div", StateOf<typeof approval, "details">>) {
  return usePart(approval, "details", {}, props, "div")
}

/* The risk in words. It steps aside (fades and shrinks to nothing) once the card is answered, so
   the answer takes its place. */
function ApprovalRisk({ className, ...props }: PartProps<"span", StateOf<typeof approval, "risk">>) {
  return usePart(
    approval,
    "risk",
    {},
    {
      ...props,
      className: withClass(
        "transition-[opacity,scale] duration-[calc(200ms*var(--kf-speed,1))] ease-house group-data-resolved/approval:pointer-events-none group-data-resolved/approval:scale-[calc(1-0.1*var(--kf-flourish,1))] group-data-resolved/approval:opacity-0 motion-reduce:transition-none",
        className,
      ),
    },
    "span",
  )
}

/* Closes to nothing once the card is answered: a grid row from 1fr to 0fr, so it needs no
   measuring. Put the details and the actions inside. */
function ApprovalBody({ className, children, ...props }: PartProps<"div", StateOf<typeof approval, "body">>) {
  return usePart(
    approval,
    "body",
    {},
    {
      ...props,
      className: withClass(
        cn(
          "grid grid-rows-[1fr] transition-[grid-template-rows,opacity] duration-[calc(380ms*var(--kf-speed,1))] ease-house",
          "data-resolved:grid-rows-[0fr] data-resolved:opacity-0 data-resolved:duration-[calc(320ms*var(--kf-speed,1))]",
          "motion-reduce:transition-none",
        ),
        className,
      ),
      children: (state) => <div className="min-h-0 overflow-hidden">{typeof children === "function" ? children(state) : children}</div>,
    },
    "div",
  )
}

/* The person's controls, inside a `data-agent-hidden` wrapper: agents never see or press them.
   The wrapper is `display: contents`, so it changes no layout. */
function ApprovalActions({ children, ...props }: PartProps<"div", StateOf<typeof approval, "actions">>) {
  return usePart(
    approval,
    "actions",
    {},
    {
      ...props,
      children: (state) => (
        <div data-agent-hidden="" data-slot="approval-controls" className="contents">
          {typeof children === "function" ? children(state) : children}
        </div>
      ),
    },
    "div",
  )
}

/* A panel that opens to its height while `open` (the reason field). Same grid-row recipe as the body. */
function ApprovalReveal({ open, className, children, ...props }: React.ComponentProps<"div"> & { open: boolean }) {
  return (
    <div
      data-slot="approval-reveal"
      data-open={open ? "" : undefined}
      inert={!open}
      className={cn(
        "grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity] duration-[calc(320ms*var(--kf-speed,1))] ease-house data-open:grid-rows-[1fr] data-open:opacity-100 motion-reduce:transition-none",
        className,
      )}
      {...props}
    >
      <div className="min-h-0 overflow-hidden">{children}</div>
    </div>
  )
}

/* The answer's mark: a tick or a cross that pops in and draws itself. */
function AnswerMark({ status }: { status: string }) {
  const draw =
    "[stroke-dasharray:1] animate-[kf-approval-draw_calc(320ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-house)_calc(100ms*var(--kf-speed,1)*var(--kf-flourish,1))_backwards] motion-reduce:animate-none"
  return (
    <svg
      data-slot="approval-mark"
      aria-hidden
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="animate-[kf-approval-pop_calc(380ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-pop)_backwards] motion-reduce:animate-none"
    >
      {status === "approved" ? (
        <path d="M3.5 8.5 6.5 11.5 12.5 5" pathLength={1} className={draw} />
      ) : (
        <path d="M4.5 4.5l7 7M11.5 4.5l-7 7" pathLength={1} className={draw} />
      )}
    </svg>
  )
}

/* "Approved · 2s ago": rises into place once there is an answer. With no children it shows the
   mark, the answer and how long ago, kept current. */
function ApprovalSummary({ className, children, ...props }: PartProps<"div", StateOf<typeof approval, "summary">>) {
  return usePart(
    approval,
    "summary",
    {},
    {
      ...props,
      className: withClass(
        "animate-[kf-approval-answer_calc(360ms*var(--kf-speed,1))_var(--ease-spring)_calc(80ms*var(--kf-speed,1))_backwards] motion-reduce:animate-none",
        className,
      ),
      children: (state) =>
        typeof children === "function"
          ? children(state)
          : (children ?? (
              <>
                <AnswerMark status={state.status} />
                <span>{state.status === "approved" ? "Approved" : "Denied"}</span>
                {state.resolvedAt !== undefined && <Ago at={state.resolvedAt} />}
              </>
            )),
    },
    "div",
  )
}

/* "· just now", "· 2s ago", "· 3m ago". A clock, not an animation. */
function Ago({ at }: { at: number }) {
  const [now, setNow] = React.useState(() => Date.now())
  React.useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])
  const seconds = Math.max(0, Math.round((now - at) / 1000))
  const text = seconds < 1 ? "just now" : seconds < 60 ? `${seconds}s ago` : seconds < 3600 ? `${Math.floor(seconds / 60)}m ago` : `${Math.floor(seconds / 3600)}h ago`
  return (
    <span data-slot="approval-ago" className="tabular-nums">
      <span aria-hidden> · </span>
      {text}
    </span>
  )
}

export {
  Approval,
  ApprovalActions,
  ApprovalBody,
  ApprovalDescription,
  ApprovalDetails,
  ApprovalIcon,
  ApprovalReveal,
  ApprovalRisk,
  ApprovalSummary,
  ApprovalTarget,
  ApprovalTitle,
  useApproval,
}
export {
  createApprovals,
  describeTarget,
  type Allow,
  type ApprovalRequest,
  type ApprovalRisk as ApprovalRiskLevel,
  type Approvals,
  type ApprovalsOptions,
  type ApprovalStatus,
} from "@/components/core/approval"
