// While something runs
// `toast.promise` shows a loading toast, then turns it into success or error when the promise settles.
import * as React from "react"

import { Button } from "@/components/ui/button"
import { createToaster, ToastRegion } from "@/components/ui/toast"

const publish = () => new Promise((resolve) => setTimeout(resolve, 1800))

export default function ToastPromise() {
  const [toast] = React.useState(() => createToaster())
  return (
    <>
      <Button
        variant="primary"
        onClick={() => toast.promise(publish, { loading: "Publishing…", success: "Published", error: "Couldn't publish" })}
      >
        Publish
      </Button>
      <ToastRegion toaster={toast} side="top" align="center" />
    </>
  )
}
