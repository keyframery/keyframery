// One date
// Dates are ISO strings, like `"2026-06-12"`, so they need no conversion to store or send.
import * as React from "react"

import { Calendar, CalendarGrid, CalendarHeader, CalendarHeading, CalendarNext, CalendarPrevious } from "@/components/ui/calendar"

export default function CalendarSingle() {
  const [date, setDate] = React.useState<string | null>(null)
  return (
    <div className="flex flex-col items-center gap-3">
      <Calendar aria-label="Delivery date" value={date} onValueChange={(value) => setDate(value as string | null)}>
        <CalendarHeader>
          <CalendarPrevious />
          <CalendarHeading />
          <CalendarNext />
        </CalendarHeader>
        <CalendarGrid />
      </Calendar>
      <span className="text-[13px] text-muted-foreground tabular-nums">{date ?? "No date picked"}</span>
    </div>
  )
}
