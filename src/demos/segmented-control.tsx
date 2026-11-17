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

export const controls = {
  orientation: { type: "select", label: "Orientation", options: ["horizontal", "vertical"], default: "horizontal" },
  disabled: { type: "switch", label: "Disabled", default: false, group: "Behaviour" },
  readOnly: { type: "switch", label: "Read only", default: false, group: "Behaviour" },
  required: { type: "switch", label: "Required", default: false, group: "Behaviour" },
  loop: { type: "switch", label: "Loop", default: true, group: "Behaviour" },
  calendarDisabled: { type: "switch", label: "Disable Calendar", default: true, group: "Behaviour" },
  title: { type: "text", label: "Title", default: "Family plan" },
  description: { type: "text", label: "Description", default: "Up to 6 people and 2 TB of storage" },
  items: { type: "slider", label: "Billing options", min: 1, max: 3, step: 1, default: 3, unit: "", group: "Layout" },
  width: { type: "slider", label: "Width", min: 300, max: 480, step: 1, default: 360, unit: "px", group: "Layout" },
  height: { type: "slider", label: "Height", min: 24, max: 48, step: 1, default: 32, unit: "px", group: "Layout" },
  gap: { type: "slider", label: "Gap", min: 0, max: 12, step: 1, default: 2, unit: "px", group: "Layout" },
  radius: { type: "slider", label: "Radius", min: 0, max: 24, step: 1, default: 12, unit: "px", group: "Layout" },
  keyRadius: { type: "slider", label: "Key radius", min: 0, max: 20, step: 1, default: 9, unit: "px", group: "Layout" },
  track: { type: "color", label: "Track", default: "", group: "Colours" },
  keyFill: { type: "color", label: "Key", default: "", group: "Colours" },
  ink: { type: "color", label: "Ink", default: "", group: "Colours" },
  selectedInk: { type: "color", label: "Selected label", default: "", group: "Colours" },
} as const

export default function SegmentedControlDemo({
  orientation = "horizontal",
  disabled = false,
  readOnly = false,
  required = false,
  loop = true,
  calendarDisabled = true,
  title = "Family plan",
  description = "Up to 6 people and 2 TB of storage",
  items = 3,
  width = 360,
  height = 32,
  gap = 2,
  radius = 12,
  keyRadius = 9,
  track = "",
  keyFill = "",
  ink = "",
  selectedInk = "",
}: {
  orientation?: "horizontal" | "vertical"
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  loop?: boolean
  calendarDisabled?: boolean
  title?: string
  description?: string
  items?: number
  width?: number
  height?: number
  gap?: number
  radius?: number
  keyRadius?: number
  track?: string
  keyFill?: string
  ink?: string
  selectedInk?: string
} = {}) {
  const theme = {
    "--segmented-control-height": `${height}px`,
    "--segmented-control-gap": `${gap}px`,
    "--segmented-control-radius": `${radius}px`,
    "--segmented-control-key-radius": `${keyRadius}px`,
    ...(track ? { "--segmented-control-track": track } : {}),
    ...(keyFill ? { "--segmented-control-key": keyFill } : {}),
    ...(ink ? { "--segmented-control-ink": ink } : {}),
    ...(selectedInk ? { "--segmented-control-selected-ink": selectedInk } : {}),
  } as React.CSSProperties
  const [period, setPeriod] = React.useState<Period>("yearly")
  React.useEffect(() => setPeriod(current => ["monthly", "yearly", "lifetime"].slice(0, items).includes(current) ? current : "monthly"), [items])
  const plan = plans[period]

  return (
    <div style={{ ...theme, maxWidth: width }} className="flex w-full flex-col items-center text-center">
      <SegmentedControl
        aria-label="Billing period" orientation={orientation} disabled={disabled} readOnly={readOnly} required={required} loop={loop}
        value={period}
        onValueChange={(next) => next && setPeriod(next as Period)}
      >
        {(["monthly", "yearly", "lifetime"] as const).slice(0, items).map(value => <SegmentedControlItem key={value} value={value}>{value === "monthly" ? "Monthly" : value === "yearly" ? "Yearly" : "Lifetime"}</SegmentedControlItem>)}
      </SegmentedControl>

      <h3 className="mt-7 text-[15px] font-semibold tracking-tight">{title}</h3>
      <p className="mt-1 text-[12px] text-muted-foreground">{description}</p>
      <div className="mt-4 flex items-baseline gap-1.5">
        <span className="text-[34px] leading-none font-semibold tracking-tight tabular-nums">{plan.price}</span>
        <span className="text-[13px] text-muted-foreground">{plan.per}</span>
      </div>
      <p className="mt-2 text-[12px] text-muted-foreground tabular-nums">{plan.note}</p>

      <div className="mt-8 flex w-full items-center justify-between border-t border-border pt-5">
        <span className="text-[13px] font-medium">View</span>
        <SegmentedControl aria-label="View" defaultValue="grid" orientation={orientation} disabled={disabled} readOnly={readOnly} required={required} loop={loop}>
          <SegmentedControlItem value="list">List</SegmentedControlItem>
          <SegmentedControlItem value="grid">Grid</SegmentedControlItem>
          <SegmentedControlItem value="map">Map</SegmentedControlItem>
          <SegmentedControlItem value="calendar" disabled={calendarDisabled}>Calendar</SegmentedControlItem>
        </SegmentedControl>
      </div>
    </div>
  )
}
