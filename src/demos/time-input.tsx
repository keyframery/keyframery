import * as React from "react"

import { TimeInput } from "@/components/ui/time-input"

export const meta = { name: "Time Input", group: "Dates" }

const hours = [
  { day: "Mon – Fri", opens: "07:30", closes: "18:00" },
  { day: "Saturday", opens: "09:00", closes: "16:30" },
  { day: "Sunday", opens: "10:00", closes: "14:00" },
]

/* The demo plays itself: the highlight glides across a closing time, turning it to the evening. */
export const play = [
  { click: '[aria-label="Saturday closes"] [data-type="hour"]', wait: 900 },
  { key: "ArrowUp", wait: 700 },
  { key: "ArrowRight", wait: 800 },
  { key: "ArrowRight", wait: 800 },
  { key: "ArrowLeft", wait: 700 },
  { key: "ArrowLeft", wait: 700 },
  { key: "ArrowDown", wait: 1200 },
]

export const controls = {
  hourCycle: { type: "select", label: "Hour cycle", options: ["12", "24"], default: "12" },
  granularity: { type: "select", label: "Granularity", options: ["hour", "minute", "second"], default: "minute" },
  disabled: { type: "switch", label: "Disabled", default: false, group: "Behaviour" },
  readOnly: { type: "switch", label: "Read only", default: false, group: "Behaviour" },
  required: { type: "switch", label: "Required", default: false, group: "Behaviour" },
  holidaysDisabled: { type: "switch", label: "Holidays disabled", default: true, group: "Behaviour" },
  items: { type: "slider", label: "Days", min: 1, max: 3, step: 1, default: 3, unit: "", group: "Layout" },
  title: { type: "text", label: "Title", default: "Opening hours" },
  subtitle: { type: "text", label: "Subtitle", default: "Little Fern Bakery" },
  min: { type: "text", label: "Earliest time", default: "" },
  max: { type: "text", label: "Latest time", default: "" },
  width: { type: "slider", label: "Width", min: 320, max: 540, step: 1, default: 380, unit: "px", group: "Layout" },
  gapX: { type: "slider", label: "Column gap", min: 4, max: 20, step: 1, default: 8, unit: "px", group: "Layout" },
  gapY: { type: "slider", label: "Row gap", min: 4, max: 24, step: 1, default: 10, unit: "px", group: "Layout" },
  height: { type: "slider", label: "Height", min: 28, max: 48, step: 1, default: 36, unit: "px", group: "Layout" },
  radius: { type: "slider", label: "Radius", min: 0, max: 20, step: 1, default: 10, unit: "px", group: "Layout" },
  segmentRadius: { type: "slider", label: "Segment radius", min: 0, max: 12, step: 1, default: 6, unit: "px", group: "Layout" },
  face: { type: "color", label: "Face", default: "", group: "Colours" },
  ink: { type: "color", label: "Ink", default: "", group: "Colours" },
  accent: { type: "color", label: "Accent", default: "", group: "Colours" },
} as const

export default function TimeInputDemo({
  hourCycle = "12",
  granularity = "minute",
  disabled = false,
  readOnly = false,
  required = false,
  holidaysDisabled = true,
  items = 3,
  title = "Opening hours",
  subtitle = "Little Fern Bakery",
  min = "",
  max = "",
  width = 380,
  gapX = 8,
  gapY = 10,
  height = 36,
  radius = 10,
  segmentRadius = 6,
  face = "",
  ink = "",
  accent = "",
}: {
  hourCycle?: "12" | "24"
  granularity?: "hour" | "minute" | "second"
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  holidaysDisabled?: boolean
  items?: number
  title?: string
  subtitle?: string
  min?: string
  max?: string
  width?: number
  gapX?: number
  gapY?: number
  height?: number
  radius?: number
  segmentRadius?: number
  face?: string
  ink?: string
  accent?: string
} = {}) {
  const theme = {
    "--time-input-height": `${height}px`,
    "--time-input-radius": `${radius}px`,
    "--time-input-segment-radius": `${segmentRadius}px`,
    ...(face ? { "--time-input-face": face } : {}),
    ...(ink ? { "--time-input-ink": ink } : {}),
    ...(accent ? { "--time-input-accent": accent } : {}),
  } as React.CSSProperties
  return (
    <div style={{ ...theme, maxWidth: width }} className="w-full">
      <h3 className="text-[15px] font-semibold tracking-tight">{title}</h3>
      <p className="mt-1 text-[13px] text-muted-foreground">{subtitle}</p>

      <div
        style={{ columnGap: gapX, rowGap: gapY }} className="mt-5 grid grid-cols-[1fr_auto_auto_auto] items-center gap-x-2 gap-y-2.5 text-[13px]"
        /* A scripted click does not focus an input by itself; this lets the self-playing loop in. */
        onClick={(event) => event.target instanceof HTMLInputElement && event.target.focus()}
      >
        {hours.slice(0, items).map((row) => (
          <div key={row.day} className="contents">
            <span className="font-medium">{row.day}</span>
            <TimeInput hourCycle={Number(hourCycle) as 12 | 24} granularity={granularity} readOnly={readOnly} required={required} max={max || undefined} disabled={disabled} min={min || undefined} defaultValue={row.opens} aria-label={`${row.day} opens`} />
            <span className="text-muted-foreground">to</span>
            <TimeInput
              hourCycle={Number(hourCycle) as 12 | 24} granularity={granularity} readOnly={readOnly} required={required} max={max || undefined}
              disabled={disabled} defaultValue={row.closes}
              min={min || row.opens}
              aria-label={`${row.day} closes`}
            />
          </div>
        ))}
        <span className="font-medium text-muted-foreground">Holidays</span>
        <TimeInput hourCycle={Number(hourCycle) as 12 | 24} granularity={granularity} readOnly={readOnly} required={required} max={max || undefined} disabled={holidaysDisabled || disabled} min={min || undefined} aria-label="Holidays opens" />
        <span className="text-muted-foreground">to</span>
        <TimeInput hourCycle={Number(hourCycle) as 12 | 24} granularity={granularity} readOnly={readOnly} required={required} max={max || undefined} disabled={holidaysDisabled || disabled} min={min || undefined} aria-label="Holidays closes" />
      </div>
    </div>
  )
}
