import {
  Waterfall,
  WaterfallAxis,
  WaterfallBar,
  WaterfallColumnHeader,
  WaterfallHeaderRow,
  WaterfallRow,
  WaterfallRowHeader,
} from "@/components/ui/waterfall"

const items = [{ value: "html", label: "index.html", start: 0, duration: 120 }]

export default function Usage() {
  return (
    <Waterfall aria-label="Requests" items={items}>
      <WaterfallHeaderRow>
        <WaterfallColumnHeader>Request</WaterfallColumnHeader>
        <WaterfallColumnHeader>
          <WaterfallAxis />
        </WaterfallColumnHeader>
      </WaterfallHeaderRow>
      <WaterfallRow value="html">
        <WaterfallRowHeader>index.html</WaterfallRowHeader>
        <WaterfallBar />
      </WaterfallRow>
    </Waterfall>
  )
}
