// Coloured by its news
// `trendColor` draws a rising line green and a falling one red. Refunds should fall, so `downIsGood` turns the colour round.
import { Sparkline } from "@/components/ui/sparkline"

const visits = [820, 870, 860, 940, 910, 1020, 1080, 1050, 1160, 1210]
const refunds = [3.1, 3.0, 3.2, 2.9, 2.7, 2.8, 2.5, 2.4, 2.3, 2.1]

export default function SparklineTrend() {
  return (
    <div className="grid w-full max-w-[280px] gap-5 text-[13px]">
      <div className="grid gap-1.5">
        <span className="font-medium">Visits</span>
        <Sparkline type="area" trendColor data={visits} label="Visits" period="last 10 days" />
      </div>
      <div className="grid gap-1.5">
        <span className="font-medium">Refund rate</span>
        <Sparkline trendColor downIsGood data={refunds} label="Refund rate" period="last 10 days" formatValue={(v) => `${v}%`} />
      </div>
    </div>
  )
}
