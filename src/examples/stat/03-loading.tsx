// Loading at its own size
// While `loading`, each part keeps its geometry as a soft block; when it ends the numbers fade back in, one part after another.
import * as React from "react"

import { Switch } from "@/components/ui/switch"
import { Stat, StatComparison, StatDelta, StatLabel, StatValue } from "@/components/ui/stat"

export default function StatLoading() {
  const [loading, setLoading] = React.useState(true)
  return (
    <div className="grid w-full max-w-[280px] gap-4">
      <label className="flex items-center gap-2 text-[13px]">
        <Switch checked={loading} onCheckedChange={setLoading} />
        Loading
      </label>
      <Stat label="Orders" value={1839} formatValue={(v) => v.toLocaleString("en-US")} delta={0.031} loading={loading}>
        <StatLabel />
        <StatValue />
        <StatDelta />
        <StatComparison>vs previous 30 days</StatComparison>
      </Stat>
    </div>
  )
}
