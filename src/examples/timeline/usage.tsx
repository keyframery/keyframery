import { Timeline, TimelineConnector, TimelineItem, TimelineMarker, TimelineTitle } from "@/components/ui/timeline"

export default function Usage() {
  return (
    <Timeline aria-label="Order">
      <TimelineItem status="complete">
        <TimelineMarker />
        <TimelineConnector />
        <TimelineTitle>Ordered</TimelineTitle>
      </TimelineItem>
      <TimelineItem status="current">
        <TimelineMarker />
        <TimelineTitle>Shipped</TimelineTitle>
      </TimelineItem>
    </Timeline>
  )
}
