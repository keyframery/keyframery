// Range
// `mode="range"` picks a start and an end. `minDays` and `maxDays` limit how long it can be.
import { Calendar } from "@/components/ui/calendar"

export default function CalendarRange() {
  return (
    <Calendar mode="range" defaultMonth="2026-07-01" defaultValue={["2026-07-08", "2026-07-12"]} minDays={2} aria-label="Stay" />
  )
}
