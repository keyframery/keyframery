import { createAgent } from "@ui-sdk/react/agent"
import * as React from "react"

import { Approval, createApprovals, type ApprovalRequest, type Approvals } from "@/components/ui/approval"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CodeBlock, CodeBlockContent } from "@/components/ui/code-block"

export const meta = { name: "Approval", group: "AI" }

/* The agent asks to refund the order and waits. Approve it: the agent presses Refund and the order
   turns refunded. Ask again and deny it: nothing changes. */
export const play = [
  { wait: 1400 },
  { click: '[data-slot="approval"] [data-action="approve"]', wait: 3200 },
  { click: '[data-action="ask"]', wait: 1800 },
  { click: '[data-slot="approval"] [data-action="deny"]', wait: 2600 },
  { click: '[data-action="ask"]', wait: 1200 },
]

export const controls = {
  risk: { type: "select", label: "Risk", options: ["low", "medium", "high"], default: "high" },
  allowAlways: { type: "switch", label: "Always allow choice", default: true },
  askReason: { type: "switch", label: "Ask why on deny", default: false },
  showDescription: { type: "switch", label: "Description", default: true },
  showTarget: { type: "switch", label: "Target", default: true },
  showDetails: { type: "switch", label: "Arguments", default: false },
  themeFace: { type: "color", label: "Card surface", default: "", group: "Colours" },
  themeAccent: { type: "color", label: "Risk accent", default: "", group: "Colours" },
  themeSuccess: { type: "color", label: "Approved", default: "", group: "Colours" },
  themeRadius: { type: "slider", label: "Corners", min: 0, max: 24, step: 1, default: 14, unit: "px", group: "Layout" },
  themeInset: { type: "slider", label: "Padding", min: 10, max: 24, step: 1, default: 14, unit: "px", group: "Layout" },
  themeFont: { type: "slider", label: "Description size", min: 11, max: 16, step: 0.5, default: 13, unit: "px", group: "Layout" },
  themeTitleFont: { type: "slider", label: "Title size", min: 12, max: 18, step: 0.5, default: 14, unit: "px", group: "Layout" },
} as const

type Risk = "low" | "medium" | "high"

/* One bridge and one set of approvals for the page. The bridge waits in `allow` for the person:
   the request it makes is real, and only Approve lets the press through. */
const settings = { risk: "high" as Risk }
let approvals: Approvals | undefined
let agent: ReturnType<typeof createAgent> | undefined
function bridge() {
  approvals ??= createApprovals({
    describe: (step) =>
      step.label === "Refund order #1048"
        ? { title: "Issue a refund", description: "£84.00 back to Priya Shah's Visa ending 4242. This can't be undone.", risk: settings.risk }
        : {},
  })
  agent ??= createAgent({ allow: approvals.allow })
  return { approvals, agent }
}

const none: ApprovalRequest[] = []

export default function ApprovalDemo({
  risk = "high",
  allowAlways = true,
  askReason = false,
  showDescription = true,
  showTarget = true,
  showDetails = false,
  themeFace = "",
  themeAccent = "",
  themeSuccess = "",
  themeRadius = 14,
  themeInset = 14,
  themeFont = 13,
  themeTitleFont = 14,
}: {
  risk?: Risk
  allowAlways?: boolean
  askReason?: boolean
  showDescription?: boolean
  showTarget?: boolean
  showDetails?: boolean
  themeFace?: string
  themeAccent?: string
  themeSuccess?: string
  themeRadius?: number
  themeInset?: number
  themeFont?: number
  themeTitleFont?: number
}) {
  settings.risk = risk
  const [refunded, setRefunded] = React.useState(false)
  const [reply, setReply] = React.useState<string | null>(null)
  const turn = React.useRef<AbortController | null>(null)
  const requests = React.useSyncExternalStore(
    (listener) => bridge().approvals.subscribe(listener),
    () => bridge().approvals.requests(),
    () => none,
  )
  const request = requests.at(-1)

  /* The agent's turn: one step, pressing Refund. It waits on `allow` until the person answers. */
  const ask = React.useCallback(() => {
    const { agent } = bridge()
    turn.current?.abort()
    const controller = new AbortController()
    turn.current = controller
    setRefunded(false)
    setReply(null)
    agent.act({ steps: [{ ref: "Refund order #1048", action: "press" }] }, { signal: controller.signal }).then((result) => {
      if (controller.signal.aborted) return
      setReply(result.ok ? "Done. Priya will see £84.00 back on her card in 3 to 5 days." : "Okay, I won't refund it. Want me to resend the parcel instead?")
    })
  }, [])

  React.useEffect(() => {
    ask()
    return () => turn.current?.abort()
  }, [ask])

  const theme = {
    ...(themeFace ? { "--approval-face": themeFace } : null),
    ...(themeAccent ? { "--approval-accent": themeAccent } : null),
    ...(themeSuccess ? { "--approval-success": themeSuccess } : null),
    ...(themeRadius !== 14 ? { "--approval-radius": `${themeRadius}px` } : null),
    ...(themeInset !== 14 ? { "--approval-inset": `${themeInset}px` } : null),
    ...(themeFont !== 13 ? { "--approval-font": `${themeFont}px` } : null),
    ...(themeTitleFont !== 14 ? { "--approval-title-font": `${themeTitleFont}px` } : null),
  } as React.CSSProperties

  return (
    <div style={theme} className="w-full max-w-[460px]">
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-[16px] rounded-br-[6px] bg-muted px-3.5 py-2.5 text-[13px] leading-snug">
          Priya's parcel never arrived. Refund order #1048.
        </div>
      </div>

      {/* The order the agent acts on. Refund is marked for a person, so the bridge asks first. */}
      <div className="@container mt-5 flex items-center gap-3 rounded-[12px] px-3 py-2.5 shadow-[0_0_0_1px_rgb(0_0_0/0.07)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08)]">
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-medium">Order #1048</div>
          <div className="truncate text-[12px] text-muted-foreground">Priya Shah · 2 items</div>
        </div>
        <span className="text-[13px] font-medium tabular-nums @max-[20rem]:hidden">£84.00</span>
        <Badge variant={refunded ? "secondary" : "success"} className="w-[68px] @max-[22rem]:hidden">{refunded ? "Refunded" : "Paid"}</Badge>
        <Button
          size="sm"
          aria-label="Refund order #1048"
          data-agent-confirm="Refunds £84.00 to Priya Shah's Visa ending 4242"
          disabled={refunded}
          onClick={() => setRefunded(true)}
        >
          Refund
        </Button>
      </div>

      <div className="mt-5 mb-2.5 flex items-center justify-between gap-3">
        <div className="text-[12px] font-medium text-muted-foreground">
          {request?.status === "pending" ? "Waiting for you" : "Agent"}
        </div>
        <button
          type="button"
          data-action="ask"
          data-agent-hidden
          onClick={ask}
          className="inline-flex h-7 items-center rounded-[8px] px-2.5 text-[12px] leading-none font-medium text-muted-foreground outline-none transition-[scale,color,background-color] duration-[calc(200ms*var(--kf-speed,1))] ease-pop hover:bg-foreground/[0.045] hover:text-foreground active:scale-[calc(1-0.04*var(--kf-flourish,1))] focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
        >
          Ask again
        </button>
      </div>

      {request && (
        <Approval
          key={request.id}
          request={request}
          risk={risk}
          description={showDescription ? undefined : ""}
          target={showTarget ? undefined : ""}
          allowAlways={allowAlways}
          askReason={askReason}
        >
          {showDetails ? (
            <CodeBlock code={JSON.stringify({ component: request.step.component, label: request.step.label, action: request.step.action, confirm: request.step.confirm }, null, 2)} language="json" size="sm" wrap>
              <CodeBlockContent />
            </CodeBlock>
          ) : undefined}
        </Approval>
      )}

      <p
        key={reply ?? "none"}
        className="mt-3 min-h-[1lh] text-[13px] leading-snug text-foreground animate-[kf-approval-answer_calc(360ms*var(--kf-speed,1))_var(--ease-spring)_backwards] motion-reduce:animate-none"
      >
        {reply}
      </p>
    </div>
  )
}
