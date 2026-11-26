// Controlled
// Pass `open` and `onOpenChange` to own the state. Streaming starting and ending still asks for a change through `onOpenChange`, so the automatic open and close keep working.
import * as React from "react"

import { Reasoning, ReasoningContent, ReasoningTrigger } from "@/components/ui/reasoning"

export default function ReasoningControlled() {
  const [open, setOpen] = React.useState(false)
  return (
    <div className="flex max-w-[380px] flex-col gap-3">
      <Reasoning duration={9} open={open} onOpenChange={setOpen}>
        <ReasoningTrigger />
        <ReasoningContent>{"Friday is the only day with seats on both legs, and it is €40 cheaper than Thursday."}</ReasoningContent>
      </Reasoning>
      <p className="text-[12px] text-muted-foreground">The thinking is {open ? "showing" : "hidden"}.</p>
    </div>
  )
}
