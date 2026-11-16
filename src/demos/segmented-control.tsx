import * as React from "react"

import { SegmentedControl, SegmentedControlItem } from "@/components/ui/segmented-control"

export const meta = { name: "Segmented Control", group: "Navigation" }

const plans = {
  monthly: { price: "€12", per: "per month", note: "Billed every month · cancel anytime" },
  yearly: { price: "€9", per: "per month", note: "€108 billed once a year · save 25%" },
  lifetime: { price: "€290", per: "once", note: "Pay once, keep every update" },
}

type Period = keyof typeof plans

/* The demo plays itself: far jumps first, so the key visibly stretches across the control. */
export const play = [
  { click: '[aria-label="Billing period"] [data-slot="segmented-control-item"]:nth-of-type(3)', wait: 1300 },
  { click: '[aria-label="Billing period"] [data-slot="segmented-control-item"]:nth-of-type(1)', wait: 1300 },
  { click: '[aria-label="View"] [data-slot="segmented-control-item"]:nth-of-type(3)', wait: 1300 },
  { click: '[aria-label="Billing period"] [data-slot="segmented-control-item"]:nth-of-type(2)', wait: 1300 },
  { click: '[aria-label="View"] [data-slot="segmented-control-item"]:nth-of-type(2)', wait: 1600 },
]

export default function SegmentedControlDemo() {
  const [period, setPeriod] = React.useState<Period>("yearly")
  const plan = plans[period]

  return (
    <div className="flex w-full max-w-[360px] flex-col items-center text-center">
      <SegmentedControl
        aria-label="Billing period"
        value={period}
        onValueChange={(next) => next && setPeriod(next as Period)}
      >
        <SegmentedControlItem value="monthly">Monthly</SegmentedControlItem>
        <SegmentedControlItem value="yearly">Yearly</SegmentedControlItem>
        <SegmentedControlItem value="lifetime">Lifetime</SegmentedControlItem>
      </SegmentedControl>

      <h3 className="mt-7 text-[15px] font-semibold tracking-tight">Family plan</h3>
      <p className="mt-1 text-[12px] text-muted-foreground">Up to 6 people and 2 TB of storage</p>
      <div className="mt-4 flex items-baseline gap-1.5">
        <span className="text-[34px] leading-none font-semibold tracking-tight tabular-nums">{plan.price}</span>
        <span className="text-[13px] text-muted-foreground">{plan.per}</span>
      </div>
      <p className="mt-2 text-[12px] text-muted-foreground tabular-nums">{plan.note}</p>

      <div className="mt-8 flex w-full items-center justify-between border-t border-border pt-5">
        <span className="text-[13px] font-medium">View</span>
        <SegmentedControl aria-label="View" defaultValue="grid">
          <SegmentedControlItem value="list">List</SegmentedControlItem>
          <SegmentedControlItem value="grid">Grid</SegmentedControlItem>
          <SegmentedControlItem value="map">Map</SegmentedControlItem>
          <SegmentedControlItem value="calendar" disabled>Calendar</SegmentedControlItem>
        </SegmentedControl>
      </div>
    </div>
  )
}
