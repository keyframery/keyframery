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

export const controls = {
  max: { type: "slider", label: "Stars", default: 5, min: 3, max: 10, step: 1, unit: "", group: "Behaviour" },
  step: { type: "select", label: "Step", default: "1", options: ["1", "0.5", "0.25"] },
  disabled: { type: "switch", label: "Disabled", default: false, group: "Behaviour" },
  readOnly: { type: "switch", label: "Read only", default: false, group: "Behaviour" },
  required: { type: "switch", label: "Required", default: false, group: "Behaviour" },
  loop: { type: "switch", label: "Loop navigation", default: false, group: "Behaviour" },
  deselectable: { type: "switch", label: "Clear selected score", default: false, group: "Behaviour" },
  initialScore: { type: "slider", label: "Your score", default: 0, min: 0, max: 5, step: 0.5, unit: "", group: "Reading" },
  title: { type: "text", label: "Stay", default: "Seaview flat, Whitstable" },
  subtitle: { type: "text", label: "Dates", default: "3 nights · 8 to 11 November" },
  question: { type: "text", label: "Question", default: "How was your stay?" },
  emptyText: { type: "text", label: "Empty hint", default: "Tap a star" },
  width: { type: "slider", label: "Width", default: 360, min: 300, max: 480, step: 1, unit: "px", group: "Layout" },
  size: { type: "slider", label: "Star area", default: 24, min: 20, max: 36, step: 1, unit: "px", group: "Layout" },
  iconSize: { type: "slider", label: "Star drawing", default: 20, min: 14, max: 30, step: 1, unit: "px", group: "Layout" },
  gap: { type: "slider", label: "Star gap", default: 2, min: 0, max: 8, step: 1, unit: "px", group: "Layout" },
  radius: { type: "slider", label: "Focus corners", default: 6, min: 0, max: 16, step: 1, unit: "px", group: "Layout" },
  fill: { type: "color", label: "Filled stars", default: "", group: "Colours" },
  empty: { type: "color", label: "Empty stars", default: "", group: "Colours" },
  preview: { type: "color", label: "Preview stars", default: "", group: "Colours" },
} as const

export default function RatingDemo({
  max = 5,
  step = "1",
  disabled = false,
  readOnly = false,
  required = false,
  loop = false,
  deselectable = false,
  initialScore = 0,
  title = "Seaview flat, Whitstable",
  subtitle = "3 nights · 8 to 11 November",
  question = "How was your stay?",
  emptyText = "Tap a star",
  width = 360,
  size = 24,
  iconSize = 20,
  gap = 2,
  radius = 6,
  fill = "",
  empty = "",
  preview = "",
}: {
  max?: number
  step?: "1" | "0.5" | "0.25"
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  loop?: boolean
  deselectable?: boolean
  initialScore?: number
  title?: string
  subtitle?: string
  question?: string
  emptyText?: string
  width?: number
  size?: number
  iconSize?: number
  gap?: number
  radius?: number
  fill?: string
  empty?: string
  preview?: string
}) {
  const theme = {
    "--rating-size": `${size}px`,
    "--rating-icon-size": `${iconSize}px`,
    "--rating-gap": `${gap}px`,
    "--rating-radius": `${radius}px`,
    ...(fill ? { "--rating-fill-colour": fill } : {}),
    ...(empty ? { "--rating-empty": empty } : {}),
    ...(preview ? { "--rating-preview": preview } : {}),
  } as React.CSSProperties
  const [score, setScore] = React.useState<number | null>(initialScore || null)

  React.useEffect(() => setScore(initialScore ? Math.min(initialScore, max) : null), [initialScore, max])
  return (
    <div style={{ ...theme, maxWidth: width }} className="w-full max-w-[360px]">
      <div className="flex items-center gap-3">
        <img src="/demo/coast-4.jpg" alt="" className="size-11 shrink-0 rounded-[10px] bg-muted object-cover" />
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold tracking-tight">{title}</h3>
          <p className="mt-1 text-[12px] text-muted-foreground">{subtitle}</p>
        </div>
      </div>

      <div className="mt-6 h-px bg-border" />

      <p id="stay" className="mt-5 text-[13px] font-medium">{question}</p>
      <div className="mt-2.5 flex items-center gap-3">
        <Rating aria-labelledby="stay" value={score} onValueChange={setScore} max={max} step={Number(step)} disabled={disabled} readOnly={readOnly} required={required} loop={loop} deselectable={deselectable} />
        <span className="text-[13px] text-muted-foreground tabular-nums">
          {score ? (words[score - 1] ?? `${score} / ${max}`) : emptyText}
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
