// Basic
// Type the date in the order of the reader's locale. Arrow keys step each part, and the value is an ISO string.
import * as React from "react"

import { DateInput } from "@/components/ui/date-input"

export default function DateInputBasic() {
  const [date, setDate] = React.useState<string | null>("1990-04-23")
  return (
    <div className="flex flex-col gap-2">
      <span id="dob-label" className="text-[13px] font-medium">
        Date of birth
      </span>
      <DateInput aria-labelledby="dob-label" value={date} onValueChange={setDate} />
      <span className="text-[12px] text-muted-foreground tabular-nums">value: {date ?? "null"}</span>
    </div>
  )
}
