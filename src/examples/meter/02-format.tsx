// Units
// `max` sets the range and `format` takes `Intl.NumberFormat` options, so the value reads in gigabytes.
import * as React from "react"

import { Button } from "@/components/ui/button"
import { Meter, MeterIndicator, MeterLabel, MeterTrack, MeterValue } from "@/components/ui/meter"

const gb = { style: "unit", unit: "gigabyte", maximumFractionDigits: 1 } as const

export default function MeterFormat() {
  const [used, setUsed] = React.useState(38.4)
  return (
    <div className="flex w-full max-w-[300px] flex-col gap-3">
      <Meter value={used} max={50} format={gb}>
        <MeterLabel>Used of 50 GB</MeterLabel>
        <MeterValue />
        <MeterTrack>
          <MeterIndicator />
        </MeterTrack>
      </Meter>
      <Button size="sm" className="self-start" onClick={() => setUsed(used > 30 ? 21.7 : 38.4)}>
        {used > 30 ? "Clear the cache" : "Undo"}
      </Button>
    </div>
  )
}
