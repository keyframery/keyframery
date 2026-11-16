// Limits and unavailable days
// `min` and `max` bound the dates. `unavailable` takes dates, ranges, weekdays or a before or after date.
import { Calendar } from "@/components/ui/calendar"

export default function CalendarUnavailable() {
  return (
    <Calendar
      defaultMonth="2026-09-01"
      min="2026-09-01"
      max="2026-10-31"
      unavailable={[{ weekday: [0, 6] }, { from: "2026-09-14", to: "2026-09-18" }]}
      aria-label="Appointment"
     />
  )
}
