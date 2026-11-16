// Basic
// The bar eases to each new value, and the number rolls with it.
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Progress, ProgressIndicator, ProgressLabel, ProgressTrack, ProgressValue } from "@/components/ui/progress"

export default function ProgressBasic() {
  const [value, setValue] = React.useState(30)
  return (
    <div className="flex w-full max-w-[300px] flex-col gap-3">
      <Progress value={value}>
        <ProgressLabel>Uploading photos</ProgressLabel>
        <ProgressValue />
        <ProgressTrack>
          <ProgressIndicator />
        </ProgressTrack>
      </Progress>
      <Button size="sm" className="self-start" onClick={() => setValue(value >= 100 ? 0 : value + 25)}>
        {value >= 100 ? "Start again" : "Add 25%"}
      </Button>
    </div>
  )
}
