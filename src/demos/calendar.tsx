import * as React from "react"

import {
  Calendar,
  CalendarGrid,
  CalendarHeader,
  CalendarHeading,
  CalendarNext,
  CalendarPrevious,
} from "@/components/ui/calendar"

export const controls = {
  mode: { type: "select", label: "Mode", default: "range", options: ["single", "multiple", "range"], group: "Behaviour" },
  disabled: { type: "switch", label: "Disabled", default: false, group: "Behaviour" },
  readOnly: { type: "switch", label: "Read only", default: false, group: "Behaviour" },
  deselectable: { type: "switch", label: "Deselectable", default: false, group: "Behaviour" },
  fixedWeeks: { type: "switch", label: "Fixed weeks", default: false, group: "Behaviour" },
  showOutsideDays: { type: "switch", label: "Show outside days", default: true, group: "Behaviour" },
  minDays: { type: "slider", label: "Minimum range days", default: 0, min: 0, max: 14, step: 1 },
  pageBy: { type: "select", label: "Page by", default: "month", options: ["month", "page"], group: "Behaviour" },
  weekdayFormat: { type: "select", label: "Weekday format", default: "short", options: ["narrow", "short", "long"], group: "Behaviour" },
  monthFormat: { type: "select", label: "Month format", default: "long", options: ["long", "short", "narrow"], group: "Behaviour" },
  locale: { type: "text", label: "Locale", default: "" },
  weekStartsOn: { type: "slider", label: "Week starts (-1 = locale)", default: -1, min: -1, max: 6, step: 1 },
  months: { type: "slider", label: "Months", default: 1, min: 1, max: 2, step: 1 },
  emptyLabel: { type: "text", label: "Empty label", default: "Pick your dates" },
  daySize: { type: "slider", label: "Day size", default: 32, min: 28, max: 40, step: 1, unit: "px", group: "Layout" },
  radius: { type: "slider", label: "Radius", default: 14, min: 0, max: 28, step: 1, unit: "px", group: "Layout" },
  gap: { type: "slider", label: "Gap", default: 2, min: 0, max: 6, step: 1, unit: "px", group: "Layout" },
  face: { type: "color", label: "Face", default: "", group: "Colours" },
  ink: { type: "color", label: "Ink", default: "", group: "Colours" },
  accent: { type: "color", label: "Accent", default: "", group: "Colours" },
} as const

export const meta = { name: "Calendar", group: "Dates" }

const iso = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`

function daysFromToday(days: number) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return iso(date)
}

const day = (offset: number) => `[data-slot="calendar-day"][data-value="${daysFromToday(offset)}"]`

/* The demo plays itself: the months turn both ways, then two stays are picked so both keys glide. */
export const play = [
  { click: '[data-slot="calendar-next"]', wait: 1300 },
  { click: '[data-slot="calendar-previous"]', wait: 1300 },
  { click: day(2), wait: 700 },
  { click: day(9), wait: 1500 },
  { click: day(5), wait: 700 },
  { click: day(7), wait: 1800 },
]

const dayMonth = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" })
const label = (date: string) => dayMonth.format(new Date(`${date}T00:00:00Z`))
const nightsBetween = (from: string, to: string) =>
  Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86400000)

export default function CalendarDemo({
  mode = "range",
  disabled = false,
  readOnly = false,
  deselectable = false,
  fixedWeeks = false,
  showOutsideDays = true,
  minDays = 0,
  pageBy = "month",
  weekdayFormat = "short",
  monthFormat = "long",
  locale = "",
  weekStartsOn = -1,
  months = 1,
  emptyLabel = "Pick your dates",
  daySize = 32,
  radius = 14,
  gap = 2,
  face = "",
  ink = "",
  accent = "",
}: {
  mode?: "single" | "multiple" | "range"
  disabled?: boolean
  readOnly?: boolean
  deselectable?: boolean
  fixedWeeks?: boolean
  showOutsideDays?: boolean
  minDays?: number
  pageBy?: "month" | "page"
  weekdayFormat?: "narrow" | "short" | "long"
  monthFormat?: "long" | "short" | "narrow"
  locale?: string
  weekStartsOn?: number
  months?: number
  emptyLabel?: string
  daySize?: number
  radius?: number
  gap?: number
  face?: string
  ink?: string
  accent?: string
}) {
  const [single, setSingle] = React.useState<string | null>(daysFromToday(4))
  const [multiple, setMultiple] = React.useState<string[]>([daysFromToday(4), daysFromToday(8)])
  const theme = {
    "--calendar-size": `${daySize}px`,
    "--calendar-radius": `${radius}px`,
    "--calendar-gap": `${gap}px`,
    ...(face ? { "--calendar-face": face } : null),
    ...(ink ? { "--calendar-ink": ink } : null),
    ...(accent ? { "--calendar-accent": accent } : null),
  } as React.CSSProperties
  const [stay, setStay] = React.useState<[string, string] | null>(() => [
    daysFromToday(4),
    daysFromToday(8),
  ])
  const nights = stay ? nightsBetween(stay[0], stay[1]) : 0

  return (
    <Calendar
      mode={mode}
      value={mode === "range" ? stay : mode === "single" ? single : multiple}
      onValueChange={(value) => {
        if (mode === "range") setStay(value as [string, string] | null)
        else if (mode === "single") setSingle(value as string | null)
        else setMultiple(value as string[])
      }}
      style={theme}
      disabled={disabled} readOnly={readOnly} deselectable={deselectable}
      fixedWeeks={fixedWeeks} showOutsideDays={showOutsideDays} minDays={minDays || undefined}
      pageBy={pageBy} weekdayFormat={weekdayFormat} monthFormat={monthFormat}
      locale={locale || undefined} weekStartsOn={weekStartsOn < 0 ? undefined : weekStartsOn} months={months}
      min={daysFromToday(0)}
      aria-label="Stay at Hollow Farm"
    >
      <CalendarHeader>
        <CalendarPrevious />
        <CalendarHeading />
        <CalendarNext />
      </CalendarHeader>
      <div className="flex gap-4">{Array.from({ length: months }, (_, offset) => <CalendarGrid key={offset} offset={offset} />)}</div>
      <div className="mt-1 flex items-baseline justify-between border-t border-border px-1.5 pt-3 pb-0.5 text-[13px]">
        <span className="font-medium tabular-nums">
          {mode === "range" ? (stay ? `${label(stay[0])} to ${label(stay[1])}` : emptyLabel) : mode === "single" ? (single ? label(single) : emptyLabel) : (multiple.length ? multiple.map(label).join(", ") : emptyLabel)}
        </span>
        <span className="text-muted-foreground tabular-nums">
          {mode === "range" ? (stay ? `${nights} ${nights === 1 ? "night" : "nights"}` : emptyLabel) : mode === "multiple" ? `${multiple.length} dates` : ""}
        </span>
      </div>
    </Calendar>
  )
}
