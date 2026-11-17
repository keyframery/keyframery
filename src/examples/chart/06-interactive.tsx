// Interactive legend and readout
// Compose the parts yourself to place them. `onActiveIndexChange` reports the point under the pointer or the arrow keys, and `hiddenSeries` with `onHiddenSeriesChange` lets the legend switch series off: they fold into the baseline while the others take their room.
import * as React from "react"

import { Chart, type ChartConfig, ChartGrid, ChartLegend, ChartMarks, ChartPlot, ChartCursor, ChartTooltip, ChartXAxis, ChartYAxis, Roll } from "@/components/ui/chart"

const data = [
  { quarter: "Q1", coffee: 8200, pastries: 3100, beans: 1900 },
  { quarter: "Q2", coffee: 9400, pastries: 3600, beans: 2300 },
  { quarter: "Q3", coffee: 10100, pastries: 3300, beans: 2700 },
  { quarter: "Q4", coffee: 11800, pastries: 4200, beans: 3900 },
]

const config = {
  coffee: { label: "Coffee" },
  pastries: { label: "Pastries" },
  beans: { label: "Beans" },
} satisfies ChartConfig

type Key = keyof typeof config

export default function ChartInteractive() {
  const [active, setActive] = React.useState<number | null>(null)
  const [hidden, setHidden] = React.useState<string[]>([])
  const shown = (Object.keys(config) as Key[]).filter((key) => !hidden.includes(key))
  const rows = active === null ? data : [data[active]]
  const total = rows.reduce((sum, row) => sum + shown.reduce((s, key) => s + row[key], 0), 0)
  return (
    <div className="w-full max-w-[520px]">
      <div className="mb-3 text-[13px] text-muted-foreground">{active === null ? "Sales this year" : `Sales in ${data[active].quarter}`}</div>
      <div className="mb-4 text-[28px] leading-none font-semibold tracking-tight">
        <Roll text={`£${total.toLocaleString("en-GB")}`} />
      </div>
      <Chart
        aria-label="Café sales by quarter"
        type="bar"
        stacked
        data={data}
        config={config}
        categoryKey="quarter"
        formatValue={(n) => `£${n.toLocaleString("en-GB")}`}
        formatTick={(n) => `£${n / 1000}k`}
        onActiveIndexChange={setActive}
        hiddenSeries={hidden}
        onHiddenSeriesChange={setHidden}
      >
        <ChartYAxis />
        <ChartPlot>
          <ChartGrid />
          <ChartCursor />
          <ChartMarks />
          <ChartTooltip indicator="line" />
        </ChartPlot>
        <ChartXAxis />
        <ChartLegend />
      </Chart>
    </div>
  )
}
