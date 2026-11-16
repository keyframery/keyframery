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

export default function TimelineDemo() {
  const [current, setCurrent] = React.useState(2)
  const [parcel, setParcel] = React.useState(0)
  const finished = current >= stages.length

  return (
    <div className="w-full max-w-[380px]">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-[15px] font-semibold tracking-tight">
            {finished ? "Delivered" : "Arriving Wednesday"}
          </h3>
          <p className="mt-1 text-[13px] text-muted-foreground tabular-nums">
            Parcel {4821 + parcel} · Royal Mail
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
          className="inline-flex h-7 cursor-pointer items-center rounded-[8px] bg-background px-2.5 text-[12px] font-medium shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_1px_rgb(0_0_0/0.05),0_3px_6px_-2px_rgb(0_0_0/0.1)] transition-[translate,scale,opacity] duration-100 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:translate-y-px active:scale-[0.985] dark:bg-accent dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07),inset_0_1px_0_rgb(255_255_255/0.08),0_2px_6px_-1px_rgb(0_0_0/0.6)]"
        >
          {finished ? "Track next" : "Refresh"}
        </button>
      </div>
      <Timeline key={parcel} aria-label="Delivery progress">
        {stages.map((stage, index) => (
          <TimelineItem
            key={stage.value}
            value={stage.value}
            status={index < current ? "complete" : index === current ? "current" : "upcoming"}
          >
            <TimelineMarker />
            <TimelineConnector />
            <TimelineTitle>{stage.title}</TimelineTitle>
            <TimelineTime>{stage.time}</TimelineTime>
            <TimelineDescription>{stage.description}</TimelineDescription>
          </TimelineItem>
        ))}
      </Timeline>
    </div>
  )
}
