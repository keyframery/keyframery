// Line chart
// `type="line"` draws each series from the left. `curve="linear"` joins the points straight, and `dots` marks every one.
import { Chart, type ChartConfig } from "@/components/ui/chart"

const data = [
  { week: "Week 1", signups: 312 },
  { week: "Week 2", signups: 368 },
  { week: "Week 3", signups: 341 },
  { week: "Week 4", signups: 420 },
  { week: "Week 5", signups: 466 },
  { week: "Week 6", signups: 458 },
  { week: "Week 7", signups: 531 },
]

const config = { signups: { label: "Sign-ups" } } satisfies ChartConfig

export default function ChartLine() {
  return (
    <Chart
      aria-label="Weekly sign-ups"
      className="max-w-[520px]"
      type="line"
      curve="linear"
      dots
      data={data}
      config={config}
      categoryKey="week"
      formatCategory={(week) => week.replace("Week ", "W")}
    />
  )
}
