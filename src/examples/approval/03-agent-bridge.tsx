// With UI SDK's agent bridge
// `createApprovals()` gives you an `allow` for `createAgent` and `registerTools`. A step on a control marked `data-agent-confirm` becomes a request; render a card for each and the bridge waits until the person answers, or the agent's signal aborts (that denies it). The card's buttons are hidden from agents, so the agent can read the card but never answer it.
import { createAgent, registerTools } from "@ui-sdk/react/agent"
import * as React from "react"

import { Approval, createApprovals } from "@/components/ui/approval"
import { Button } from "@/components/ui/button"

const approvals = createApprovals()
const agent = typeof window === "undefined" ? undefined : createAgent({ allow: approvals.allow })
if (agent) registerTools(agent, { allow: approvals.allow })

export default function ApprovalAgentBridge() {
  const requests = React.useSyncExternalStore(approvals.subscribe, approvals.requests, approvals.requests)
  const [deleted, setDeleted] = React.useState(false)
  return (
    <div className="flex w-full max-w-[440px] flex-col gap-3">
      <div className="flex items-center gap-2">
        <Button size="sm" data-agent-confirm="Deletes order #1048 for good" disabled={deleted} onClick={() => setDeleted(true)}>
          {deleted ? "Deleted" : "Delete order #1048"}
        </Button>
        <Button size="sm" variant="ghost" data-agent-hidden onClick={() => agent?.act({ steps: [{ ref: "Delete order #1048", action: "press" }] })}>
          Let the agent try
        </Button>
      </div>
      {requests.map((request) => (
        <Approval key={request.id} request={request} title="Delete an order" allowAlways />
      ))}
    </div>
  )
}
