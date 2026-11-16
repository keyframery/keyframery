// Basic
// Click a star, or use the arrow keys. Screen readers hear “3 stars”.
import * as React from "react"

import { Rating } from "@/components/ui/rating"

const words = ["Poor", "Fair", "Good", "Great", "Perfect"]

export default function RatingBasic() {
  const [score, setScore] = React.useState<number | null>(null)
  return (
    <div className="flex items-center gap-3">
      <Rating aria-label="Your rating" value={score} onValueChange={setScore} />
      <span className="text-[13px] text-muted-foreground">{score ? words[score - 1] : "Tap a star"}</span>
    </div>
  )
}
