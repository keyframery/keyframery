import * as React from "react"

import { Meter, MeterIndicator, MeterLabel, MeterTrack, MeterValue } from "@/components/ui/meter"

export const meta = { name: "Meter", group: "Display" }

/* Frees up space and puts it back: the fills spring and the values roll. */
export const play = [
  { click: "[data-play=toggle]", wait: 2200 },
  { click: "[data-play=toggle]", wait: 2200 },
]

const key =
  "inline-flex h-8 cursor-pointer items-center rounded-[9px] bg-background px-3 text-[13px] leading-none font-medium text-foreground outline-none select-none shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_1px_rgb(0_0_0/0.05),0_3px_6px_-2px_rgb(0_0_0/0.1)] transition-[translate,scale,box-shadow] duration-100 active:translate-y-px active:scale-[0.985] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card dark:bg-accent dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07),inset_0_1px_0_rgb(255_255_255/0.08),0_2px_6px_-1px_rgb(0_0_0/0.6)] motion-reduce:transition-none"

const gb = { style: "unit", unit: "gigabyte", maximumFractionDigits: 1 } as const

export default function MeterDemo() {
  const [cleaned, setCleaned] = React.useState(false)
  const videos = cleaned ? 3.6 : 12.4
  const used = 31.2 + videos + 3.7

  const rows = [
    { name: "Photos", size: 31.2 },
    { name: "Videos", size: videos },
    { name: "Documents", size: 3.7 },
  ]

  return (
    <div className="w-[400px]">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-[15px] font-semibold tracking-tight">Storage</h3>
        <p className="text-[12px] text-muted-foreground">Family plan</p>
      </div>
      <p className="mt-1 text-[13px] text-muted-foreground">
        {cleaned ? "Plenty of room for this summer’s photos" : "Almost full. New photos may stop syncing."}
      </p>

      <div className="mt-4 rounded-[14px] bg-card p-4 shadow-[0_0_0_1px_rgb(0_0_0/0.07),0_1px_2px_rgb(0_0_0/0.04)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08)]">
        <Meter value={used} max={50} high={45} format={gb}>
          <MeterLabel>Used of 50 GB</MeterLabel>
          <MeterValue />
          <MeterTrack>
            <MeterIndicator />
          </MeterTrack>
        </Meter>

        <ul className="mt-4 space-y-3">
          {rows.map((row) => (
            <li key={row.name}>
              <Meter value={row.size} max={50} format={gb} className="gap-y-1.5">
                <MeterLabel className="font-normal text-muted-foreground">{row.name}</MeterLabel>
                <MeterValue className="text-[12px]" />
                <MeterTrack className="h-1">
                  <MeterIndicator className="bg-foreground/45" />
                </MeterTrack>
              </Meter>
            </li>
          ))}
        </ul>

        <div className="mt-5 flex items-center justify-between gap-3">
          <span className="text-[12px] text-muted-foreground tabular-nums">
            {cleaned ? "4 videos moved to your computer" : "4 videos over 2 GB"}
          </span>
          <button type="button" data-play="toggle" className={key} onClick={() => setCleaned((c) => !c)}>
            {cleaned ? "Undo" : "Free up 8.8 GB"}
          </button>
        </div>
      </div>
    </div>
  )
}
