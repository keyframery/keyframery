// Controlled
// Pass `checked` and `onCheckedChange` to keep it in your own state.
import * as React from "react"

import { Checkbox } from "@/components/ui/checkbox"

export default function CheckboxControlled() {
  const [agreed, setAgreed] = React.useState(false)
  return (
    <div className="flex flex-col items-start gap-2 text-[13px]">
      <label className="flex items-center gap-2.5">
        <Checkbox checked={agreed} onCheckedChange={(checked) => setAgreed(checked === true)} />
        I've read the terms
      </label>
      <span className="text-muted-foreground">{agreed ? "Thanks, you can continue." : "Tick the box to continue."}</span>
    </div>
  )
}
