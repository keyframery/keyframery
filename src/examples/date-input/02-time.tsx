// With a time
// `granularity="minute"` adds hours and minutes. `hourCycle` picks 12 or 24 hours.
import { DateInput } from "@/components/ui/date-input"

export default function DateInputTime() {
  return (
    <div className="flex flex-col gap-2">
      <span id="departs-label" className="text-[13px] font-medium">
        Departs
      </span>
      <DateInput aria-labelledby="departs-label" granularity="minute" defaultValue="2026-08-14T07:40" />
    </div>
  )
}
