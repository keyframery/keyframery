// Controlled
// Pass `checked` and `onCheckedChange` to drive something else with it.
import * as React from "react"

import { Switch } from "@/components/ui/switch"

export default function SwitchControlled() {
  const [on, setOn] = React.useState(false)
  return (
    <div className="flex flex-col items-center gap-3">
      <label className="flex items-center gap-3 text-[13px] font-medium">
        <Switch checked={on} onCheckedChange={setOn} />
        Focus mode
      </label>
      <span className="text-[12px] text-muted-foreground">{on ? "Notifications are paused." : "You'll get notifications."}</span>
    </div>
  )
}
