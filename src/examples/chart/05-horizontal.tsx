// Horizontal bars
// `orientation="horizontal"` lays the bars down, categories down the side. Good for long names; set your own colour per series in the config.
import { Chart, type ChartConfig } from "@/components/ui/chart"

const data = [
  { city: "Lisbon", orders: 1284 },
  { city: "Berlin", orders: 1102 },
  { city: "Amsterdam", orders: 846 },
  { city: "Copenhagen", orders: 610 },
  { city: "Vienna", orders: 455 },
]

const config = { orders: { label: "Orders", color: "var(--chart-2)" } } satisfies ChartConfig

export default function ChartHorizontal() {
  return <Chart aria-label="Orders by city" className="max-w-[520px] [--chart-height:14rem]" orientation="horizontal" data={data} config={config} categoryKey="city" />
}
