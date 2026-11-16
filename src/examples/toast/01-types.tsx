// Types
// `toast.success`, `toast.error` and plain `toast`. Each gets its own mark, drawn as it arrives.
import * as React from "react"

import { Button } from "@/components/ui/button"
import { createToaster, ToastRegion } from "@/components/ui/toast"

export default function ToastTypes() {
  // In an app, import the shared `toast` and render one <ToastRegion /> near the root.
  const [toast] = React.useState(() => createToaster())
  return (
    <div className="flex flex-wrap justify-center gap-2">
      <Button onClick={() => toast("Draft saved")}>Default</Button>
      <Button onClick={() => toast.success("Payment sent", { description: "£48.00 to Maya Chen" })}>Success</Button>
      <Button onClick={() => toast.error("Couldn't upload", { description: "The file is over 10 MB." })}>Error</Button>
      <ToastRegion toaster={toast} />
    </div>
  )
}
