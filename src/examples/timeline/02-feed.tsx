// Activity feed
// `feed` marks it as a live list of events, so screen readers announce new ones. Leave out the statuses for plain history.
import { Timeline, TimelineConnector, TimelineDescription, TimelineItem, TimelineMarker, TimelineTime, TimelineTitle } from "@/components/ui/timeline"

const events = [
  { who: "Maya", what: "merged “New pricing page”", time: "2h" },
  { who: "Tom", what: "commented on the onboarding spec", time: "5h" },
  { who: "Ines", what: "opened “Dark mode for charts”", time: "Yesterday" },
]

export default function TimelineFeed() {
  return (
    <Timeline feed aria-label="Activity" className="w-full max-w-[340px]">
      {events.map((e) => (
        <TimelineItem key={e.what}>
          <TimelineMarker />
          <TimelineConnector />
          <TimelineTitle>{e.who}</TimelineTitle>
          <TimelineTime>{e.time}</TimelineTime>
          <TimelineDescription>{e.what}</TimelineDescription>
        </TimelineItem>
      ))}
    </Timeline>
  )
}
