// Changing the ratio
// A new `ratio` is reached on a spring, so the frame reshapes instead of snapping.
import * as React from "react"

import { AspectRatio, AspectRatioImage } from "@/components/ui/aspect-ratio"
import { Button } from "@/components/ui/button"

const ratios = [
  { label: "Wide", value: 16 / 9 },
  { label: "Photo", value: 4 / 3 },
  { label: "Square", value: 1 },
]

export default function AspectRatioChange() {
  const [ratio, setRatio] = React.useState(16 / 9)
  return (
    <div className="flex w-full max-w-[360px] flex-col gap-3">
      <AspectRatio ratio={ratio}>
        <AspectRatioImage src="/demo/walk-18.jpg" alt="A path through the woods" />
      </AspectRatio>
      <div className="flex gap-2">
        {ratios.map((r) => (
          <Button key={r.label} size="sm" variant={r.value === ratio ? "primary" : "default"} onClick={() => setRatio(r.value)}>
            {r.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
