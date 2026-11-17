import * as React from "react"

import {
  Timeline,
  TimelineConnector,
  TimelineDescription,
  TimelineItem,
  TimelineMarker,
  TimelineTime,
  TimelineTitle,
} from "@/components/ui/timeline"

export const meta = { name: "Timeline", group: "Display" }

const stages = [
  { value: "ordered", title: "Order placed", time: "Mon 9:14", description: "Linen throw, oat · 1 item" },
  { value: "packed", title: "Packed", time: "Mon 16:02", description: "Left our Leeds warehouse" },
  { value: "transit", title: "In transit", time: "Tue 7:40", description: "At the Manchester depot" },
  { value: "out", title: "Out for delivery", time: "Wed", description: "Driver arrives 10:00 to 12:00" },
  { value: "delivered", title: "Delivered", time: "Wed", description: "Leave with a neighbour if out" },
]

/* The demo plays itself: the parcel moves on stage by stage, then a new parcel cascades in. */
export const play = [
  { click: "[data-slot=timeline-refresh]", wait: 1500 },
  { click: "[data-slot=timeline-refresh]", wait: 1500 },
  { click: "[data-slot=timeline-refresh]", wait: 1800 },
  { click: "[data-slot=timeline-refresh]", wait: 1800 },
]

export const controls = {
  orientation: { type: "select", label: "Orientation", options: ["vertical", "horizontal"], default: "vertical" },
  loop: { type: "switch", label: "Loop", default: true, group: "Behaviour" },
  feed: { type: "switch", label: "Feed", default: false, group: "Behaviour" },
  busy: { type: "switch", label: "Busy", default: false, group: "Behaviour" },
  statuses: { type: "switch", label: "Process statuses", default: true, group: "Behaviour" },
  showTimes: { type: "switch", label: "Show times", default: true, group: "Behaviour" },
  showDescriptions: { type: "switch", label: "Show descriptions", default: true, group: "Behaviour" },
  items: { type: "slider", label: "Stages", min: 1, max: 5, step: 1, default: 5, unit: "", group: "Layout" },
  currentStep: { type: "slider", label: "Completed stages", min: 0, max: 5, step: 1, default: 2, unit: "", group: "Layout" },
  title: { type: "text", label: "Title", default: "Arriving Wednesday" },
  carrier: { type: "text", label: "Carrier", default: "Royal Mail" },
  width: { type: "slider", label: "Width", min: 300, max: 720, step: 1, default: 380, unit: "px", group: "Layout" },
  gap: { type: "slider", label: "Marker gap", min: 4, max: 24, step: 1, default: 12, unit: "px", group: "Layout" },
  radius: { type: "slider", label: "Radius", min: 0, max: 20, step: 1, default: 10, unit: "px", group: "Layout" },
  markerSize: { type: "slider", label: "Marker size", min: 12, max: 20, step: 1, default: 16, unit: "px", group: "Layout" },
  currentFill: { type: "color", label: "Current step", default: "", group: "Colours" },
  complete: { type: "color", label: "Complete", default: "", group: "Colours" },
  ink: { type: "color", label: "Ink", default: "", group: "Colours" },
  muted: { type: "color", label: "Muted", default: "", group: "Colours" },
  rail: { type: "color", label: "Rail", default: "", group: "Colours" },
} as const

export default function TimelineDemo({
  orientation = "vertical",
  loop = true,
  feed = false,
  busy = false,
  statuses = true,
  showTimes = true,
  showDescriptions = true,
  items = 5,
  currentStep = 2,
  title = "Arriving Wednesday",
  carrier = "Royal Mail",
  width = 380,
  gap = 12,
  radius = 10,
  markerSize = 16,
  currentFill = "",
  complete = "",
  ink = "",
  muted = "",
  rail = "",
}: {
  orientation?: "vertical" | "horizontal"
  loop?: boolean
  feed?: boolean
  busy?: boolean
  statuses?: boolean
  showTimes?: boolean
  showDescriptions?: boolean
  items?: number
  currentStep?: number
  title?: string
  carrier?: string
  width?: number
  gap?: number
  radius?: number
  markerSize?: number
  currentFill?: string
  complete?: string
  ink?: string
  muted?: string
  rail?: string
} = {}) {
  const theme = {
    "--timeline-gap": `${gap}px`,
    "--timeline-radius": `${radius}px`,
    "--timeline-marker-size": `${markerSize}px`,
    ...(complete ? { "--timeline-complete": complete } : {}),
    ...(ink ? { "--timeline-ink": ink } : {}),
    ...(muted ? { "--timeline-muted": muted } : {}),
    ...(rail ? { "--timeline-rail": rail } : {}),
    ...(currentFill ? { "--timeline-current": currentFill } : {}),
  } as React.CSSProperties
  const [current, setCurrent] = React.useState(currentStep)
  React.useEffect(() => setCurrent(currentStep), [currentStep])
  const [parcel, setParcel] = React.useState(0)
  const finished = current >= items

  return (
    <div style={{ ...theme, maxWidth: width }} className="w-full">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-[15px] font-semibold tracking-tight">
            {finished ? "Delivered" : title}
          </h3>
          <p className="mt-1 text-[13px] text-muted-foreground tabular-nums">
            Parcel {4821 + parcel} · {carrier}
          </p>
        </div>
        <button
          type="button"
          data-slot="timeline-refresh"
          onClick={() => {
            if (finished) {
              setParcel((n) => n + 1)
              setCurrent(1)
            } else setCurrent((step) => step + 1)
          }}
          className="inline-flex h-7 cursor-pointer items-center rounded-[8px] bg-background px-2.5 text-[12px] font-medium shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_1px_rgb(0_0_0/0.05),0_3px_6px_-2px_rgb(0_0_0/0.1)] transition-[translate,scale,opacity] duration-[calc(100ms*var(--kf-speed,1))] ease-house motion-reduce:transition-none outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:translate-y-px active:scale-[0.985] dark:bg-accent dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07),inset_0_1px_0_rgb(255_255_255/0.08),0_2px_6px_-1px_rgb(0_0_0/0.6)]"
        >
          {finished ? "Track next" : "Refresh"}
        </button>
      </div>
      <div className={orientation === "horizontal" ? "overflow-x-auto" : "overflow-visible"}><Timeline style={{ minWidth: orientation === "horizontal" ? items * 132 : undefined }} orientation={orientation} loop={loop} feed={feed} busy={busy} key={parcel} aria-label="Delivery progress">
        {stages.slice(0, items).map((stage, index) => (
          <TimelineItem
            key={stage.value}
            value={stage.value}
            status={statuses ? (index < current ? "complete" : index === current ? "current" : "upcoming") : undefined}
          >
            <TimelineMarker />
            <TimelineConnector />
            <TimelineTitle>{stage.title}</TimelineTitle>
            {showTimes && <TimelineTime>{stage.time}</TimelineTime>}
            {showDescriptions && <TimelineDescription>{stage.description}</TimelineDescription>}
          </TimelineItem>
        ))}
      </Timeline></div>
    </div>
  )
}
