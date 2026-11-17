// In a button
// Put it in the button while the work runs. It pops in, and `label` tells screen readers what is happening.
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

export default function SpinnerButton() {
  const [sending, setSending] = React.useState(false)
  return (
    <Button
      variant="primary"
      onClick={() => {
        setSending(true)
        setTimeout(() => setSending(false), 2000)
      }}
    >
      {sending && <Spinner size="sm" label="Sending invoice" />}
      {sending ? "Sending" : "Send invoice"}
    </Button>
  )
}
