// With an undo
// Give it an `action` for one quick follow-up, like undo. Hovering the stack pauses every toast's timer.
import * as React from "react"

import { Button } from "@/components/ui/button"
import { createToaster, ToastRegion } from "@/components/ui/toast"

export default function ToastAction() {
  const [toast] = React.useState(() => createToaster())
  return (
    <>
      <Button
        variant="destructive"
        onClick={() =>
          toast("Email archived", {
            action: { label: "Undo", onAction: () => toast.success("Moved back to the inbox") },
          })
        }
      >
        Archive
      </Button>
      <ToastRegion toaster={toast} />
    </>
  )
}
