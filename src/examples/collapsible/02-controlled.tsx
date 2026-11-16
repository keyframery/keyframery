// Controlled
// Pass `open` and `onOpenChange` to open it from elsewhere.
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Collapsible, CollapsiblePanel, CollapsibleTrigger } from "@/components/ui/collapsible"

export default function CollapsibleControlled() {
  const [open, setOpen] = React.useState(false)
  return (
    <div className="flex w-full max-w-[360px] flex-col items-start gap-3">
      <Button size="sm" onClick={() => setOpen(!open)}>
        {open ? "Close" : "Open"} from outside
      </Button>
      <Collapsible open={open} onOpenChange={setOpen} className="w-full">
        <CollapsibleTrigger>Advanced settings</CollapsibleTrigger>
        <CollapsiblePanel>
          <p className="pt-2 text-[13px] text-muted-foreground">Proxy, cache size and logging live here.</p>
        </CollapsiblePanel>
      </Collapsible>
    </div>
  )
}
