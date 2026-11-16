// Nested spans
// Give an item `children` for a trace. `visibleWaterfallRows` lists the rows, and `WaterfallIndicator` folds a span open and shut.
import {
  Waterfall,
  WaterfallAxis,
  WaterfallBar,
  WaterfallColumnHeader,
  type WaterfallData,
  WaterfallHeaderRow,
  WaterfallIndicator,
  WaterfallRow,
  WaterfallRowHeader,
  visibleWaterfallRows,
} from "@/components/ui/waterfall"

const trace: WaterfallData = [
  {
    value: "request",
    label: "GET /checkout",
    start: 0,
    duration: 620,
    children: [
      { value: "auth", label: "auth", start: 10, duration: 80 },
      { value: "cart", label: "load cart", start: 100, duration: 220 },
      { value: "render", label: "render", start: 330, duration: 280 },
    ],
  },
]

const rows = visibleWaterfallRows(trace, ["request"])

export default function WaterfallNested() {
  return (
    <Waterfall aria-label="Trace" items={trace} defaultExpanded={["request"]} className="w-full max-w-[480px] grid-cols-[130px_minmax(0,1fr)]">
      <WaterfallHeaderRow>
        <WaterfallColumnHeader>Span</WaterfallColumnHeader>
        <WaterfallColumnHeader aria-label="Timeline">
          <WaterfallAxis maxTicks={4} />
        </WaterfallColumnHeader>
      </WaterfallHeaderRow>
      {rows.map(({ item }) => (
        <WaterfallRow key={item.value} value={item.value}>
          <WaterfallRowHeader>
            {item.children && <WaterfallIndicator />}
            {item.label}
          </WaterfallRowHeader>
          <WaterfallBar />
        </WaterfallRow>
      ))}
    </Waterfall>
  )
}
