import * as React from "react"

import { Meter, MeterIndicator, MeterLabel, MeterTrack, MeterValue } from "@/components/ui/meter"

export const meta = { name: "Meter", group: "Display" }

/* Frees up space and puts it back: the fills spring and the values roll. */
export const play = [
  { click: "[data-play=toggle]", wait: 2200 },
  { click: "[data-play=toggle]", wait: 2200 },
]

const key =
  "inline-flex h-8 cursor-pointer items-center rounded-[9px] bg-background px-3 text-[13px] leading-none font-medium text-foreground outline-none select-none shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_1px_rgb(0_0_0/0.05),0_3px_6px_-2px_rgb(0_0_0/0.1)] transition-[translate,scale,box-shadow] duration-[calc(100ms*var(--kf-speed,1))] ease-house active:translate-y-px active:scale-[0.985] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card dark:bg-accent dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07),inset_0_1px_0_rgb(255_255_255/0.08),0_2px_6px_-1px_rgb(0_0_0/0.6)] motion-reduce:transition-none"

const gb = { style: "unit", unit: "gigabyte", maximumFractionDigits: 1 } as const

export const controls = {
  title: { type: "text", label: "Heading", default: "Storage" },
  photos: { type: "slider", label: "Photos", default: 31.2, min: 0, max: 50, step: 0.1, unit: " GB", group: "Reading" },
  videoSize: { type: "slider", label: "Videos", default: 12.4, min: 0, max: 50, step: 0.1, unit: " GB", group: "Reading" },
  documents: { type: "slider", label: "Documents", default: 3.7, min: 0, max: 50, step: 0.1, unit: " GB", group: "Reading" },
  min: { type: "slider", label: "Minimum", default: 0, min: 0, max: 40, step: 1, unit: " GB", group: "Reading" },
  max: { type: "slider", label: "Capacity", default: 50, min: 41, max: 200, step: 1, unit: " GB", group: "Reading" },
  high: { type: "slider", label: "High threshold", default: 45, min: 0, max: 100, step: 1, unit: " GB", group: "Reading" },
  format: { type: "select", label: "Value format", default: "gigabyte", options: ["gigabyte", "decimal", "percent"] },
  locale: { type: "select", label: "Number locale", default: "default", options: ["default", "en-US", "de-DE", "fr-FR"] },
  rtl: { type: "switch", label: "Right to left", default: false, group: "Behaviour" },
  items: { type: "slider", label: "Category meters", default: 3, min: 0, max: 3, step: 1, unit: "", group: "Layout" },
  width: { type: "slider", label: "Width", default: 400, min: 280, max: 480, step: 1, unit: "px", group: "Layout" },
  gap: { type: "slider", label: "Label gap", default: 8, min: 2, max: 20, step: 1, unit: "px", group: "Layout" },
  height: { type: "slider", label: "Track height", default: 6, min: 3, max: 16, step: 1, unit: "px", group: "Layout" },
  corners: { type: "select", label: "Track corners", default: "pill", options: ["pill", "soft", "square"] },
  fill: { type: "color", label: "Fill", default: "", group: "Colours" },
  track: { type: "color", label: "Track", default: "", group: "Colours" },
  ink: { type: "color", label: "Label", default: "", group: "Colours" },
  valueColour: { type: "color", label: "Value", default: "", group: "Colours" },
  danger: { type: "color", label: "High reading", default: "", group: "Colours" },
} as const

export default function MeterDemo({
  title = "Storage",
  photos = 31.2,
  videoSize = 12.4,
  documents = 3.7,
  min = 0,
  max = 50,
  high = 45,
  format = "gigabyte",
  locale = "default",
  rtl = false,
  items = 3,
  width = 400,
  gap = 8,
  height = 6,
  corners = "pill",
  fill = "",
  track = "",
  ink = "",
  valueColour = "",
  danger = "",
}: {
  title?: string
  photos?: number
  videoSize?: number
  documents?: number
  min?: number
  max?: number
  high?: number
  format?: "gigabyte" | "decimal" | "percent"
  locale?: "default" | "en-US" | "de-DE" | "fr-FR"
  rtl?: boolean
  items?: number
  width?: number
  gap?: number
  height?: number
  corners?: "pill" | "soft" | "square"
  fill?: string
  track?: string
  ink?: string
  valueColour?: string
  danger?: string
}) {
  const theme = {
    "--meter-gap": `${gap}px`,
    "--meter-height": `${height}px`,
    "--meter-radius": corners === "pill" ? "9999px" : corners === "soft" ? "4px" : "0px",
    ...(valueColour ? { "--meter-value-ink": valueColour } : {}),
    ...(fill ? { "--meter-fill": fill } : {}),
    ...(track ? { "--meter-track": track } : {}),
    ...(ink ? { "--meter-ink": ink } : {}),
    ...(danger ? { "--meter-danger": danger } : {}),
  } as React.CSSProperties
  const [cleaned, setCleaned] = React.useState(false)
  const videos = cleaned ? Math.max(0, videoSize - 8.8) : videoSize
  const used = photos + videos + documents
  const numberFormat = format === "gigabyte" ? gb : { style: format, maximumFractionDigits: 1 } as const

  const rows = [
    { name: "Photos", size: photos },
    { name: "Videos", size: videos },
    { name: "Documents", size: documents },
  ]

  return (
    <div dir={rtl ? "rtl" : undefined} style={{ ...theme, maxWidth: width }} className="w-full max-w-[400px]">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-[15px] font-semibold tracking-tight">{title}</h3>
        <p className="text-[12px] text-muted-foreground">Family plan</p>
      </div>
      <p className="mt-1 text-[13px] text-muted-foreground">
        {cleaned ? "Plenty of room for this summer’s photos" : "Almost full. New photos may stop syncing."}
      </p>

      <div className="mt-4 rounded-[14px] bg-card p-4 shadow-[0_0_0_1px_rgb(0_0_0/0.07),0_1px_2px_rgb(0_0_0/0.04)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08)]">
        <Meter value={used} min={min} max={max} high={high} format={numberFormat} locale={locale === "default" ? undefined : locale}>
          <MeterLabel>Used of {max} GB</MeterLabel>
          <MeterValue />
          <MeterTrack>
            <MeterIndicator />
          </MeterTrack>
        </Meter>

        <ul className="mt-4 space-y-3">
          {rows.slice(0, items).map((row) => (
            <li key={row.name}>
              <Meter value={row.size} min={min} max={max} format={numberFormat} locale={locale === "default" ? undefined : locale} style={{ "--meter-gap": `${gap * 0.75}px` } as React.CSSProperties} className="gap-y-1.5">
                <MeterLabel className="font-normal text-muted-foreground">{row.name}</MeterLabel>
                <MeterValue className="text-[12px]" />
                <MeterTrack style={{ height: height * 2 / 3 }} className="h-1">
                  <MeterIndicator className="bg-[var(--meter-fill,color-mix(in_oklab,var(--foreground)_45%,transparent))]" />
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
