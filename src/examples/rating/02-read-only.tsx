// Read only, with halves
// `readOnly` shows a score, and a fraction fills part of a star. `getValueLabel` words it for screen readers.
import { Rating } from "@/components/ui/rating"

export default function RatingReadOnly() {
  return (
    <div className="flex items-center gap-2 text-[13px]">
      <Rating value={4.5} readOnly getValueLabel={(value, max) => `Rated ${value} out of ${max}`} />
      <span className="font-medium">4.5</span>
      <span className="text-muted-foreground">(1,284 reviews)</span>
    </div>
  )
}
