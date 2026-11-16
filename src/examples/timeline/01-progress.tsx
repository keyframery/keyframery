// Order progress
// Each item's `status` is complete, current or upcoming. Moving it on fills the connector and lights the next marker.
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Timeline, TimelineConnector, TimelineDescription, TimelineItem, TimelineMarker, TimelineTime, TimelineTitle } from "@/components/ui/timeline"

const steps = [
  { title: "Ordered", time: "Mon 09:12", about: "Payment received" },
  { title: "Packed", time: "Mon 16:40", about: "At the warehouse in Leeds" },
  { title: "Out for delivery", time: "Wed", about: "With your local driver" },
  { title: "Delivered", time: "Wed", about: "Left with a neighbour" },
]

export default function TimelineProgress() {
  const [current, setCurrent] = React.useState(1)
  return (
    <div className="flex w-full max-w-[340px] flex-col gap-4">
      <Timeline aria-label="Delivery">
        {steps.map((step, i) => (
          <TimelineItem key={step.title} status={i < current ? "complete" : i === current ? "current" : "upcoming"}>
            <TimelineMarker />
            <TimelineConnector />
            <TimelineTitle>{step.title}</TimelineTitle>
            <TimelineTime>{step.time}</TimelineTime>
            <TimelineDescription>{step.about}</TimelineDescription>
          </TimelineItem>
        ))}
      </Timeline>
      <Button size="sm" className="self-start" onClick={() => setCurrent((c) => (c >= steps.length ? 0 : c + 1))}>
        {current >= steps.length ? "Start again" : "Next step"}
      </Button>
    </div>
  )
}
