// Dismissible
// `AlertClose` dismisses it: the alert fades and folds its height away, so the page closes up. Control it with `open` and `onOpenChange`.
import { Info } from "lucide-react"
import * as React from "react"

import { Alert, AlertClose, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

export default function AlertDismissible() {
  const [open, setOpen] = React.useState(true)
  return (
    <div className="flex w-full max-w-[420px] flex-col gap-3">
      <Alert open={open} onOpenChange={setOpen}>
        <Info />
        <AlertTitle>New: split the bill</AlertTitle>
        <AlertDescription>Everyone at the table can now pay their own share from the receipt.</AlertDescription>
        <AlertClose />
      </Alert>
      {!open && (
        <Button size="sm" className="self-start" onClick={() => setOpen(true)}>
          Show again
        </Button>
      )}
    </div>
  )
}
