// Indeterminate
// `value={null}` when you can't tell how long it will take. The bar sweeps until a value arrives.
import { Progress, ProgressIndicator, ProgressLabel, ProgressTrack } from "@/components/ui/progress"

export default function ProgressIndeterminate() {
  return (
    <Progress value={null} className="w-full max-w-[300px]">
      <ProgressLabel>Preparing your export</ProgressLabel>
      <ProgressTrack>
        <ProgressIndicator />
      </ProgressTrack>
    </Progress>
  )
}
