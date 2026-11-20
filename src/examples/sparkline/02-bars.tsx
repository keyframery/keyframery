// Bars, a target and the high and low
// `type="bar"` grows the bars one after another. `reference` draws a dashed line at a value; `extremes` marks the highest and lowest point.
import { Sparkline } from "@/components/ui/sparkline"

const orders = [42, 38, 51, 47, 63, 58, 44, 49, 55, 61, 67, 59, 71, 64]
const days = orders.map((_, i) => `Nov ${i + 6}`)

export default function SparklineBars() {
  return (
    <Sparkline
      className="max-w-[280px] [--sparkline-height:3rem]"
      type="bar"
      data={orders}
      labels={days}
      reference={50}
      extremes
      label="Orders"
      period="last 14 days"
      formatValue={(v) => `${v} orders`}
    />
  )
}
