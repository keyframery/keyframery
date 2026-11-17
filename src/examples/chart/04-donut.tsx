// Donut
// For a ring, each row is a slice: `categoryKey` names it and the one numeric key is its value. Label the slices in the config; the hole shows the total, or the slice under the pointer.
import { Chart, type ChartConfig } from "@/components/ui/chart"

const data = [
  { plan: "starter", members: 1240 },
  { plan: "team", members: 860 },
  { plan: "business", members: 410 },
  { plan: "enterprise", members: 95 },
]

const config = {
  members: { label: "Members" },
  starter: { label: "Starter" },
  team: { label: "Team" },
  business: { label: "Business" },
  enterprise: { label: "Enterprise" },
} satisfies ChartConfig

export default function ChartDonut() {
  return <Chart aria-label="Members by plan" className="max-w-[360px] [--chart-height:18rem]" type="donut" data={data} config={config} categoryKey="plan" />
}
