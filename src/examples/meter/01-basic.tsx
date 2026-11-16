// Basic
// A measurement in a known range, like storage or battery. For a task that's under way, use Progress.
import { Meter, MeterIndicator, MeterLabel, MeterTrack, MeterValue } from "@/components/ui/meter"

export default function MeterBasic() {
  return (
    <Meter value={72} className="w-full max-w-[300px]">
      <MeterLabel>Battery</MeterLabel>
      <MeterValue />
      <MeterTrack>
        <MeterIndicator />
      </MeterTrack>
    </Meter>
  )
}
