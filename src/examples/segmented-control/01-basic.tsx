// Basic
// One choice from a few. The key glides to the one you pick.
import * as React from "react"

import { SegmentedControl, SegmentedControlItem } from "@/components/ui/segmented-control"

const prices = { monthly: "£9 a month", yearly: "£90 a year" }

export default function SegmentedControlBasic() {
  const [period, setPeriod] = React.useState<keyof typeof prices>("yearly")
  return (
    <div className="flex flex-col items-center gap-3">
      <SegmentedControl aria-label="Billing" value={period} onValueChange={(v) => v && setPeriod(v as keyof typeof prices)}>
        <SegmentedControlItem value="monthly">Monthly</SegmentedControlItem>
        <SegmentedControlItem value="yearly">Yearly</SegmentedControlItem>
      </SegmentedControl>
      <span className="text-[14px] font-medium">{prices[period]}</span>
    </div>
  )
}
