// Limits
// `min` and `max` mark a date outside them as invalid, and the field says so.
import { DateInput } from "@/components/ui/date-input"

export default function DateInputLimits() {
  return (
    <div className="flex flex-col gap-2">
      <span id="start-label" className="text-[13px] font-medium">
        Start date (2026 only)
      </span>
      <DateInput aria-labelledby="start-label" min="2026-01-01" max="2026-12-31" defaultValue="2027-01-05" />
    </div>
  )
}
