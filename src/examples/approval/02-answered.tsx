// Asking why, and the answer
// `askReason` opens a field before Deny goes through; `onDeny` gets what was typed. Once answered the card closes to one line: "Approved · 2s ago" or "Denied". Control it with `status`.
import * as React from "react"

import { Approval } from "@/components/ui/approval"

export default function ApprovalAnswered() {
  const [reason, setReason] = React.useState<string>()
  return (
    <div className="flex w-full max-w-[440px] flex-col gap-3">
      <Approval title="Cancel the Lisbon booking" description="Memmo Alfama, 14 to 17 March. Free to cancel until Friday." target="Press “Cancel booking”" risk="medium" askReason onDeny={(why) => setReason(why ?? "")} />
      {reason !== undefined && <p className="text-[12.5px] text-muted-foreground">Reason given: {reason || "none"}</p>}
      <Approval title="Issue a refund" risk="high" status="approved" resolvedAt={Date.now() - 12_000} />
    </div>
  )
}
