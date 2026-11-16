// Opening hours
// `hourCycle={12}` shows AM and PM. `min` on the closing time keeps it after the opening time.
import { TimeInput } from "@/components/ui/time-input"

export default function TimeInputRange() {
  return (
    <div className="flex items-center gap-2 text-[13px]">
      <TimeInput hourCycle={12} defaultValue="08:00" aria-label="Opens" />
      <span className="text-muted-foreground">to</span>
      <TimeInput hourCycle={12} defaultValue="17:30" min="08:00" aria-label="Closes" />
    </div>
  )
}
