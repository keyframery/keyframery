// Network requests
// Each item has a `start` and a `duration`. The axis picks its own ticks, and the bars draw in from the left.
import {
  Waterfall,
  WaterfallAxis,
  WaterfallBar,
  WaterfallCell,
  WaterfallColumnHeader,
  WaterfallHeaderRow,
  WaterfallRow,
  WaterfallRowHeader,
} from "@/components/ui/waterfall"

const requests = [
  { value: "html", label: "index.html", start: 0, duration: 180 },
  { value: "css", label: "app.css", start: 190, duration: 90 },
  { value: "js", label: "app.js", start: 190, duration: 340 },
  { value: "font", label: "inter.woff2", start: 300, duration: 120 },
  { value: "api", label: "/api/feed", start: 540, duration: 260 },
]

export default function WaterfallRequests() {
  return (
    <Waterfall aria-label="Network requests" items={requests} className="w-full max-w-[520px] grid-cols-[110px_56px_minmax(0,1fr)]">
      <WaterfallHeaderRow>
        <WaterfallColumnHeader>Request</WaterfallColumnHeader>
        <WaterfallColumnHeader className="justify-end">Time</WaterfallColumnHeader>
        <WaterfallColumnHeader aria-label="Timeline">
          <WaterfallAxis maxTicks={4} />
        </WaterfallColumnHeader>
      </WaterfallHeaderRow>
      {requests.map((r) => (
        <WaterfallRow key={r.value} value={r.value}>
          <WaterfallRowHeader>{r.label}</WaterfallRowHeader>
          <WaterfallCell className="justify-end tabular-nums">{r.duration} ms</WaterfallCell>
          <WaterfallBar />
        </WaterfallRow>
      ))}
    </Waterfall>
  )
}
