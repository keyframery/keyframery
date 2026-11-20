// A stat with every part
// The label, an icon, the value, the delta with its comparison, and a sparkline that takes the delta's colour.
import { Wallet } from "lucide-react"

import { Sparkline } from "@/components/ui/sparkline"
import { Stat, StatChart, StatComparison, StatDelta, StatIcon, StatLabel, StatValue } from "@/components/ui/stat"

const money = (v: number) => `$${Math.round(v).toLocaleString("en-US")}`
const daily = [3120, 3380, 3290, 3610, 3540, 3880, 4020, 3950, 4210, 4380, 4290, 4620, 4710, 4890]

export default function StatCard() {
  return (
    <Stat className="w-full max-w-[300px]" label="Revenue" value={daily.reduce((a, b) => a + b, 0)} formatValue={money} delta={0.124}>
      <StatLabel />
      <StatIcon>
        <Wallet />
      </StatIcon>
      <StatValue />
      <StatDelta />
      <StatComparison>vs previous 14 days</StatComparison>
      <StatChart>
        <Sparkline type="area" data={daily} label="Revenue per day" period="last 14 days" formatValue={money} />
      </StatChart>
    </Stat>
  )
}
