import { Chart, type ChartConfig } from "@/components/ui/chart"

const data = [
  { month: "Jan", visitors: 1840 },
  { month: "Feb", visitors: 2120 },
  { month: "Mar", visitors: 1980 },
]

const config = { visitors: { label: "Visitors" } } satisfies ChartConfig

export default function Usage() {
  return <Chart aria-label="Visitors" data={data} config={config} categoryKey="month" />
}
