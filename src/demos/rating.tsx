import * as React from "react"

import { Rating } from "@/components/ui/rating"

export const meta = { name: "Rating", group: "Forms" }

/* The demo plays itself: a five fills star by star from the left, then a two, then a four. */
export const play = [
  { click: '[aria-labelledby="stay"] [data-slot="rating-item"]:nth-child(5) [role="radio"]', wait: 1500 },
  { click: '[aria-labelledby="stay"] [data-slot="rating-item"]:nth-child(2) [role="radio"]', wait: 1200 },
  { click: '[aria-labelledby="stay"] [data-slot="rating-item"]:nth-child(4) [role="radio"]', wait: 1800 },
]

const words = ["Poor", "Below par", "Good", "Great", "Outstanding"]

export default function RatingDemo() {
  const [score, setScore] = React.useState<number | null>(null)

  return (
    <div className="w-[360px]">
      <div className="flex items-center gap-3">
        <img src="/demo/coast-4.jpg" alt="" className="size-11 shrink-0 rounded-[10px] bg-muted object-cover" />
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold tracking-tight">Seaview flat, Whitstable</h3>
          <p className="mt-1 text-[12px] text-muted-foreground">3 nights · 8 to 11 November</p>
        </div>
      </div>

      <div className="mt-6 h-px bg-border" />

      <p id="stay" className="mt-5 text-[13px] font-medium">How was your stay?</p>
      <div className="mt-2.5 flex items-center gap-3">
        <Rating aria-labelledby="stay" value={score} onValueChange={setScore} />
        <span className="text-[13px] text-muted-foreground tabular-nums">
          {score ? words[score - 1] : "Tap a star"}
        </span>
      </div>

      <div className="mt-6 flex items-center gap-2 rounded-[10px] bg-muted/70 px-3 py-2.5">
        <Rating
          value={4.6}
          readOnly
          getValueLabel={(value, max) => `Rated ${value} out of ${max}`}
          className="gap-0 [&_[data-slot=rating-item]]:size-4 [&_[data-slot=rating-item]>span]:size-3.5"
        />
        <span className="text-[13px] font-semibold tabular-nums">4.6</span>
        <span className="text-[12px] text-muted-foreground tabular-nums">from 214 guests</span>
      </div>
    </div>
  )
}
