// A row of stats
// StatGroup puts stats on one surface with hairlines between them: four across on a wide container, two, then one. Refunds should fall, so `downIsGood` colours their fall green.
import { Stat, StatComparison, StatDelta, StatGroup, StatLabel, StatValue } from "@/components/ui/stat"

const stats = [
  { label: "Revenue", value: 124505, format: (v: number) => `$${v.toLocaleString("en-US")}`, delta: 0.065 },
  { label: "Orders", value: 1839, format: (v: number) => v.toLocaleString("en-US"), delta: 0.031 },
  { label: "Average order", value: 67.7, format: (v: number) => `$${v.toFixed(2)}`, delta: -0.012 },
  { label: "Refund rate", value: 0.02, format: (v: number) => `${(v * 100).toFixed(1)}%`, delta: -0.027, downIsGood: true },
]

export default function StatRow() {
  return (
    <StatGroup aria-label="Store, last 30 days">
      {stats.map((s) => (
        <Stat key={s.label} label={s.label} value={s.value} formatValue={s.format} delta={s.delta} downIsGood={s.downIsGood}>
          <StatLabel />
          <StatValue />
          <StatDelta />
          <StatComparison>vs previous 30 days</StatComparison>
        </Stat>
      ))}
    </StatGroup>
  )
}
