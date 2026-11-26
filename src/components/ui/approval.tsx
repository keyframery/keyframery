"use client"

export * from "@/components/primitives/approval"

/* Theming variables (set on a part or ancestor; absent values preserve the theme):
   --approval-face: Card surface; default: bg-card.
   --approval-accent: Risk accent (icon tile, risk label); default: muted-foreground (low), foreground (medium), destructive (high).
   --approval-success: Approved answer; default: payoff green oklch(0.62 0.16 150).
   --approval-radius: Card corners; default: rounded-[14px].
   --approval-font: Description size; default: text-[13px].
   --approval-title-font: Title size; default: text-[14px].
   --approval-inset: Card padding; default: 14px.
*/

/* Styled approval: the animated primitive plus the Keyframery look. A card on the card surface: a
   shield tile tinted by the risk, the title, what the agent would press, and a footer band with
   "Always allow", Deny and Approve (Keyframery's checkbox and buttons, hidden from agents). High
   risk turns the accent destructive, styles Approve as destructive and gives Deny the default
   focus. Once answered the card closes to its header and the answer sits where the risk was. */

import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import {
  Approval as ApprovalRoot,
  ApprovalActions as ApprovalActionsPrimitive,
  ApprovalBody as ApprovalBodyPrimitive,
  ApprovalDescription as ApprovalDescriptionPrimitive,
  ApprovalDetails as ApprovalDetailsPrimitive,
  ApprovalIcon as ApprovalIconPrimitive,
  ApprovalReveal,
  ApprovalRisk as ApprovalRiskPrimitive,
  ApprovalSummary as ApprovalSummaryPrimitive,
  ApprovalTarget as ApprovalTargetPrimitive,
  ApprovalTitle as ApprovalTitlePrimitive,
  useApproval,
  type ApprovalRequest,
  type ApprovalRiskLevel,
  type ApprovalStatus,
} from "@/components/primitives/approval"
import { Speed, type SpeedProps } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

/* UI SDK accepts a class name or a function of state; keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

const riskWords: Record<ApprovalRiskLevel, string> = { low: "Low risk", medium: "Medium risk", high: "High risk" }

type ApprovalProps = Omit<React.ComponentProps<typeof ApprovalRoot>, "title" | "children"> &
  SpeedProps & {
    /** What the agent wants to do, like "Issue a refund". */
    title?: React.ReactNode
    /** A sentence on what it changes, like "£84.00 back to Priya Shah's Visa ending 4242". */
    description?: React.ReactNode
    /** The control it would use, like "Press “Refund order #1048”". */
    target?: React.ReactNode
    /** Show "Always allow this action". */
    allowAlways?: boolean
    /** Focus the default button when the card arrives: Approve, or Deny at high risk. */
    autoFocus?: boolean
    /** A request from `createApprovals()`: binds title, description, target, risk, status and the answer. */
    request?: ApprovalRequest
    /** Details shown above the buttons: a diff, the arguments, a summary. */
    children?: React.ReactNode
  }

/* With no `children` it shows title, description and target; `children` adds details (a diff, the
   arguments) above the buttons. */
function Approval({
  speed,
  className,
  title,
  description,
  target,
  risk,
  status,
  onApprove,
  onDeny,
  allowAlways = false,
  autoFocus = false,
  request,
  resolvedAt,
  children,
  ...props
}: ApprovalProps) {
  const bound = request
    ? {
        title: title ?? request.title,
        description: description ?? request.description,
        target: target ?? request.target,
        risk: risk ?? request.risk,
        status: status ?? request.status,
        resolvedAt: resolvedAt ?? request.resolvedAt,
        onApprove: (details: { always: boolean }) => {
          onApprove?.(details)
          request.approve({ always: details.always })
        },
        onDeny: (reason: string | undefined) => {
          onDeny?.(reason)
          request.deny(reason)
        },
      }
    : { title, description, target, risk, status, resolvedAt, onApprove, onDeny }
  return (
    <Speed speed={speed}>
      <ApprovalRoot
        risk={bound.risk}
        status={bound.status}
        resolvedAt={bound.resolvedAt}
        onApprove={bound.onApprove}
        onDeny={bound.onDeny}
        className={withClass(
          cn(
            "@container w-full min-w-0 overflow-hidden rounded-[var(--approval-radius,14px)] bg-[var(--approval-face,var(--card))] text-card-foreground",
            "shadow-[0_0_0_1px_rgb(0_0_0/0.07),0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_-12px_rgb(0_0_0/0.12)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_8px_24px_-12px_rgb(0_0_0/0.7)]",
            "[--approval-tone:var(--approval-accent,var(--foreground))] data-[risk=low]:[--approval-tone:var(--approval-accent,var(--muted-foreground))] data-[risk=high]:[--approval-tone:var(--approval-accent,var(--destructive))]",
            "[--approval-pad:var(--approval-inset,14px)]",
          ),
          className,
        )}
        {...props}
      >
        <div className="flex min-w-0 items-start gap-3 p-[var(--approval-pad)]">
          <ApprovalIcon />
          <div className="flex min-w-0 flex-1 items-center gap-3 self-center">
            <ApprovalTitle className="flex-1">{bound.title}</ApprovalTitle>
            <span className="grid shrink-0 justify-items-end *:col-start-1 *:row-start-1">
              <ApprovalRisk />
              <ApprovalSummary />
            </span>
          </div>
        </div>
        <ApprovalBody>
          {(bound.description || bound.target || children) && (
            <div className="-mt-1.5 flex min-w-0 flex-col gap-2.5 ps-[calc(var(--approval-pad)+2.75rem)] @max-[24rem]:ps-[var(--approval-pad)] @max-[24rem]:mt-0 pe-[var(--approval-pad)] pb-[var(--approval-pad)]">
              {bound.description && <ApprovalDescription>{bound.description}</ApprovalDescription>}
              {bound.target && <ApprovalTarget>{bound.target}</ApprovalTarget>}
              {children && <ApprovalDetails>{children}</ApprovalDetails>}
            </div>
          )}
          <ApprovalActions allowAlways={allowAlways} autoFocus={autoFocus} />
        </ApprovalBody>
      </ApprovalRoot>
    </Speed>
  )
}

/* A shield in a tile tinted by the risk. */
function ApprovalIcon({ className, children, ...props }: React.ComponentProps<typeof ApprovalIconPrimitive>) {
  return (
    <ApprovalIconPrimitive
      className={withClass(
        cn(
          "grid size-8 shrink-0 place-items-center rounded-[9px] text-[color:var(--approval-tone)] [&_svg]:size-4",
          "bg-[color-mix(in_oklab,var(--approval-tone)_9%,transparent)] dark:bg-[color-mix(in_oklab,var(--approval-tone)_16%,transparent)]",
          "transition-[color,background-color] duration-[calc(240ms*var(--kf-speed,1))] ease-house motion-reduce:transition-none",
          "group-data-resolved/approval:bg-muted group-data-resolved/approval:text-muted-foreground",
        ),
        className,
      )}
      {...props}
    >
      {children ?? (
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 1.75 13 3.6v3.9c0 3.05-2.15 5.25-5 6.75-2.85-1.5-5-3.7-5-6.75V3.6Z" />
          <path d="M8 5.5v2.75M8 10.5v.01" />
        </svg>
      )}
    </ApprovalIconPrimitive>
  )
}

function ApprovalTitle({ className, ...props }: React.ComponentProps<typeof ApprovalTitlePrimitive>) {
  return (
    <ApprovalTitlePrimitive
      className={withClass(
        "min-w-0 truncate text-[length:var(--approval-title-font,14px)] leading-[1.35] font-semibold tracking-tight text-foreground",
        className,
      )}
      {...props}
    />
  )
}

function ApprovalDescription({ className, ...props }: React.ComponentProps<typeof ApprovalDescriptionPrimitive>) {
  return (
    <ApprovalDescriptionPrimitive
      className={withClass("text-[length:var(--approval-font,13px)] leading-relaxed text-muted-foreground", className)}
      {...props}
    />
  )
}

/* What the agent would press: a quiet chip with a pointer, so it reads as a control, not prose. */
function ApprovalTarget({ className, children, ...props }: Omit<React.ComponentProps<typeof ApprovalTargetPrimitive>, "children"> & { children?: React.ReactNode }) {
  return (
    <ApprovalTargetPrimitive
      className={withClass(
        "inline-flex h-7 w-fit max-w-full min-w-0 items-center gap-1.5 rounded-[8px] bg-muted px-2.5 text-[12.5px] leading-none font-medium text-foreground shadow-[inset_0_0_0_1px_rgb(0_0_0/0.04)] dark:shadow-[inset_0_0_0_1px_rgb(255_255_255/0.05)]",
        className,
      )}
      {...props}
    >
      <svg aria-hidden viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-3.5 shrink-0 text-muted-foreground">
        <path d="m3.5 3.5 3.25 9 1.4-3.85 3.85-1.4Z M8.9 8.9l3.6 3.6" />
      </svg>
      <span className="min-w-0 truncate">{children}</span>
    </ApprovalTargetPrimitive>
  )
}

function ApprovalDetails({ className, ...props }: React.ComponentProps<typeof ApprovalDetailsPrimitive>) {
  return <ApprovalDetailsPrimitive className={withClass("min-w-0 text-[12.5px] text-muted-foreground", className)} {...props} />
}

/* The risk as a small badge; destructive at high risk. */
function ApprovalRisk({ className, children, ...props }: React.ComponentProps<typeof ApprovalRiskPrimitive>) {
  return (
    <ApprovalRiskPrimitive className={withClass("inline-flex", className)} {...props}>
      {(state) => (
        <Badge variant={state.risk === "high" ? "destructive" : "outline"} className="[--badge-ink:var(--approval-accent)]">
          {typeof children === "function" ? children(state) : (children ?? riskWords[state.risk])}
        </Badge>
      )}
    </ApprovalRiskPrimitive>
  )
}

/* "Approved · 2s ago" in the payoff green, or "Denied" in muted ink. */
function ApprovalSummary({ className, ...props }: React.ComponentProps<typeof ApprovalSummaryPrimitive>) {
  return (
    <ApprovalSummaryPrimitive
      className={withClass(
        cn(
          "flex h-5 items-center gap-1 text-[12.5px] leading-none font-medium whitespace-nowrap [&_[data-slot=approval-mark]]:size-3.5",
          "data-[status=approved]:text-[color:var(--approval-success,color-mix(in_oklch,oklch(0.62_0.16_150)_85%,var(--foreground)))] dark:data-[status=approved]:text-[color:var(--approval-success,oklch(0.62_0.16_150))]",
          "data-[status=denied]:text-muted-foreground [&_[data-slot=approval-ago]]:font-normal [&_[data-slot=approval-ago]]:text-muted-foreground",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* The body: details and buttons. Closes once the card is answered. */
const ApprovalBody = ApprovalBodyPrimitive

/* The footer band: "Always allow" on the left, Deny and Approve on the right. With `askReason` on
   the card, Deny first opens a field for the reason. Hidden from agents (from the core). */
function ApprovalActions({
  className,
  allowAlways = false,
  autoFocus = false,
  ...props
}: React.ComponentProps<typeof ApprovalActionsPrimitive> & { allowAlways?: boolean; autoFocus?: boolean }) {
  const { api } = useApproval()
  const approveRef = React.useRef<HTMLButtonElement>(null)
  const denyRef = React.useRef<HTMLButtonElement>(null)
  const reasonRef = React.useRef<HTMLTextAreaElement>(null)
  const id = React.useId()
  return (
    <ApprovalActionsPrimitive
      className={withClass(
        cn(
          "flex flex-col border-t border-border/70 bg-[color-mix(in_oklab,var(--muted)_45%,transparent)] px-[var(--approval-pad)] py-2.5",
          "dark:bg-[color-mix(in_oklab,var(--muted)_30%,transparent)]",
        ),
        className,
      )}
      {...props}
    >
      {(state) => (
        <ActionsContent
          state={state}
          api={api}
          allowAlways={allowAlways}
          autoFocus={autoFocus}
          refs={{ approveRef, denyRef, reasonRef }}
          id={id}
        />
      )}
    </ApprovalActionsPrimitive>
  )
}

type ActionsState = { stage: "ask" | "reason"; risk: ApprovalRiskLevel; always: boolean; reason: string; status: ApprovalStatus }

function ActionsContent({
  state,
  api,
  allowAlways,
  autoFocus,
  refs,
  id,
}: {
  state: ActionsState
  api: ReturnType<typeof useApproval>["api"]
  allowAlways: boolean
  autoFocus: boolean
  refs: { approveRef: React.RefObject<HTMLButtonElement | null>; denyRef: React.RefObject<HTMLButtonElement | null>; reasonRef: React.RefObject<HTMLTextAreaElement | null> }
  id: string
}) {
  const high = state.risk === "high"
  const asking = state.stage === "reason"
  /* The default button takes focus when the card arrives (if asked), and the reason field when it opens. */
  React.useEffect(() => {
    if (autoFocus && state.status === "pending") (high ? refs.denyRef : refs.approveRef).current?.focus({ preventScroll: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  React.useEffect(() => {
    if (asking) refs.reasonRef.current?.focus({ preventScroll: true })
  }, [asking, refs.reasonRef])
  return (
    <>
      <ApprovalReveal open={asking}>
        <div className="pt-0.5 pb-2.5">
          <Textarea
            ref={refs.reasonRef}
            aria-label="Why not? (optional)"
            placeholder="Why not? (optional)"
            value={state.reason}
            onValueChange={(value) => api.setReason(value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) api.deny()
              if (e.key === "Escape") api.back()
            }}
            className="min-h-[60px]"
          />
        </div>
      </ApprovalReveal>
      <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
        {allowAlways && !asking && (
          <label htmlFor={`${id}-always`} className="me-auto flex min-w-0 cursor-pointer items-center gap-2 text-[12.5px] leading-none text-muted-foreground select-none hover:text-foreground">
            <Checkbox id={`${id}-always`} checked={state.always} onCheckedChange={(checked) => api.setAlways(checked === true)} className="[--checkbox-size:16px] [--checkbox-radius:4.5px]" />
            Always allow this action
          </label>
        )}
        <div className="ms-auto flex shrink-0 items-center gap-2">
          {asking ? (
            <>
              <Button size="sm" variant="ghost" onClick={() => api.back()}>
                Back
              </Button>
              <Button size="sm" variant="destructive" onClick={(e) => api.deny(undefined, e.nativeEvent)}>
                Deny
              </Button>
            </>
          ) : (
            <>
              <Button ref={refs.denyRef} size="sm" data-action="deny" onClick={(e) => api.pressDeny(e.nativeEvent)}>
                Deny
              </Button>
              <Button
                ref={refs.approveRef}
                size="sm"
                data-action="approve"
                variant={high ? "destructive" : "primary"}
                onClick={(e) => api.approve(e.nativeEvent)}
              >
                Approve
              </Button>
            </>
          )}
        </div>
      </div>
    </>
  )
}

export {
  Approval,
  ApprovalActions,
  ApprovalBody,
  ApprovalDescription,
  ApprovalDetails,
  ApprovalIcon,
  ApprovalRisk,
  ApprovalSummary,
  ApprovalTarget,
  ApprovalTitle,
}
