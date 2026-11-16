// Controlled
// Pass `open` and `onOpenChange` to open it from code, like after a save.
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogBackdrop, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function DialogControlled() {
  const [open, setOpen] = React.useState(false)
  const publish = () => new Promise((resolve) => setTimeout(resolve, 900)).then(() => setOpen(true))
  return (
    <>
      <Button variant="primary" onClick={publish}>
        Publish
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogBackdrop />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>It's live</DialogTitle>
            <DialogDescription>Your post is published and shared with 1,204 followers.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose variant="primary">Done</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
