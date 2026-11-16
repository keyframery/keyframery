// Basic
// Type the hours and minutes, or step them with the arrow keys. The value is `"HH:mm"`.
import * as React from "react"

import { TimeInput } from "@/components/ui/time-input"

export default function TimeInputBasic() {
  const [time, setTime] = React.useState<string | null>("08:30")
  return (
    <div className="flex flex-col gap-2">
      <TimeInput aria-label="Alarm" value={time} onValueChange={setTime} />
      <span className="text-[12px] text-muted-foreground tabular-nums">value: {time ?? "null"}</span>
    </div>
  )
}
