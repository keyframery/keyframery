// Status
// `status` is "pending", "running", "approval", "done", "error" or "denied". The mark follows it: a dashed ring, a spinner, a pause, a tick that draws itself, a mark, a slash. Pass `startedAt` and a running call counts up.
import * as React from "react"

import { ToolCall } from "@/components/ui/tool-call"

export default function ToolCallStatus() {
  const [startedAt] = React.useState(() => Date.now())
  return (
    <div className="flex w-full max-w-[420px] flex-col gap-2">
      <ToolCall name="find_order" title="Looked up order #1048" status="done" input={{ order_id: "1048" }} output={{ status: "shipped" }} duration={420} />
      <ToolCall name="send_email" title="Writing to Priya" status="running" input={{ to: "priya@example.com" }} startedAt={startedAt} />
      <ToolCall name="issue_refund" title="Refund £84.00" status="approval" input={{ order_id: "1048", amount: 84 }} />
      <ToolCall name="cancel_order" title="Cancel order #1048" status="denied" input={{ order_id: "1048" }} />
      <ToolCall name="notify_courier" title="Tell the courier" status="pending" input={{ carrier: "royal_mail" }} />
    </div>
  )
}

