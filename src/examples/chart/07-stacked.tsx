// Stacked bars
// `stacked` puts each series on the one before it, in config order. On arrival every stack builds up from the baseline, segment by segment; the tooltip adds the total, and switching a series off in the legend re-stacks the rest.
import { Chart, type ChartConfig } from "@/components/ui/chart"

const data = [
  { month: "July", online: 29800, store: 16900, wholesale: 8800 },
  { month: "August", online: 31400, store: 15200, wholesale: 9900 },
  { month: "September", online: 28900, store: 16700, wholesale: 10400 },
  { month: "October", online: 33700, store: 18300, wholesale: 9700 },
  { month: "November", online: 38200, store: 21900, wholesale: 11200 },
  { month: "December", online: 44600, store: 27400, wholesale: 12800 },
]

const config = {
  online: { label: "Online" },
  store: { label: "In store" },
  wholesale: { label: "Wholesale" },
} satisfies ChartConfig

const money = (v: number) => `$${v.toLocaleString("en-US")}`

export default function ChartStacked() {
  return (
    <Chart
      aria-label="Revenue by channel, second half of 2026"
      className="max-w-[520px]"
      data={data}
      config={config}
      categoryKey="month"
      stacked
      formatValue={money}
      formatCategory={(month) => month.slice(0, 3)}
    />
  )
}
