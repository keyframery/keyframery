// Bar chart
// Rows of data and a config naming each series, as in shadcn's charts. Colours come from `--chart-1` to `--chart-5` in config order; bars grow from the baseline and the tooltip follows the pointer or the arrow keys.
import { Chart, type ChartConfig } from "@/components/ui/chart"

const data = [
  { month: "January", desktop: 1860, mobile: 2410 },
  { month: "February", desktop: 2050, mobile: 2690 },
  { month: "March", desktop: 2370, mobile: 2880 },
  { month: "April", desktop: 1730, mobile: 2210 },
  { month: "May", desktop: 2090, mobile: 3020 },
  { month: "June", desktop: 2140, mobile: 3360 },
]

const config = {
  desktop: { label: "Desktop" },
  mobile: { label: "Mobile" },
} satisfies ChartConfig

export default function ChartBar() {
  return (
    <Chart
      aria-label="Visitors by device, first half of 2026"
      className="max-w-[520px]"
      data={data}
      config={config}
      categoryKey="month"
      formatCategory={(month) => month.slice(0, 3)}
    />
  )
}
