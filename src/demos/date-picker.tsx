import * as React from "react"

import {
  CalendarGrid,
  CalendarHeader,
  CalendarHeading,
  CalendarNext,
  CalendarPrevious,
  DatePicker,
  DatePickerContent,
  DatePickerField,
  DatePickerHint,
  DatePickerInput,
  DatePickerPreset,
  DatePickerTrigger,
} from "@/components/ui/date-picker"

export const controls = {
  mode: { type: "select", label: "Mode", default: "single", options: ["single", "range"], group: "Behaviour" },
  disabled: { type: "switch", label: "Disabled", default: false, group: "Behaviour" },
  readOnly: { type: "switch", label: "Read only", default: false, group: "Behaviour" },
  required: { type: "switch", label: "Required", default: false, group: "Behaviour" },
  closeOnSelect: { type: "switch", label: "Close on select", default: true, group: "Behaviour" },
  dismissible: { type: "switch", label: "Dismissible", default: true, group: "Behaviour" },
  showOutsideDays: { type: "switch", label: "Show outside days", default: true, group: "Behaviour" },
  side: { type: "select", label: "Side", default: "bottom", options: ["bottom", "top", "left", "right"], group: "Behaviour" },
  align: { type: "select", label: "Align", default: "start", options: ["start", "center", "end"], group: "Behaviour" },
  presentation: { type: "select", label: "Presentation", default: "popover", options: ["popover", "sheet", "auto"], group: "Behaviour" },
  months: { type: "slider", label: "Months", default: 1, min: 1, max: 2, step: 1 },
  title: { type: "text", label: "Title", default: "The Old Bakery, Rye" },
  subtitle: { type: "text", label: "Subtitle", default: "Double room · €118 a night" },
  label: { type: "text", label: "Label", default: "Check-in" },
  width: { type: "slider", label: "Width", default: 320, min: 280, max: 480, step: 1, unit: "px", group: "Layout" },
  gap: { type: "slider", label: "Gap", default: 6, min: 0, max: 24, step: 1, unit: "px", group: "Layout" },
  radius: { type: "slider", label: "Radius", default: 14, min: 0, max: 28, step: 1, unit: "px", group: "Layout" },
  face: { type: "color", label: "Face", default: "", group: "Colours" },
  ink: { type: "color", label: "Ink", default: "", group: "Colours" },
  accent: { type: "color", label: "Accent", default: "", group: "Colours" },
} as const

export const meta = { name: "Date Picker", group: "Dates" }

const iso = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`

function daysFromToday(days: number) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return iso(date)
}

/* The next Friday, or the one after if today is Friday. */
function nextFriday() {
  const date = new Date()
  date.setDate(date.getDate() + (((5 - date.getDay() + 7) % 7) || 7))
  return iso(date)
}

const day = (offset: number) =>
  `[data-slot="date-picker-content"] [data-slot="calendar-day"][data-value="${daysFromToday(offset)}"]`

/* The demo plays itself: the calendar unfolds, turns a month each way, a day is picked, then a shortcut. */
export const play = [
  { click: '[data-slot="date-picker-trigger"]', wait: 1200 },
  { click: '[data-slot="date-picker-content"] [data-slot="calendar-next"]', wait: 1100 },
  { click: '[data-slot="date-picker-content"] [data-slot="calendar-previous"]', wait: 1100 },
  { click: day(6), wait: 1500 },
  { click: '[data-slot="date-picker-trigger"]', wait: 1200 },
  { click: '[data-slot="date-picker-preset"]:nth-child(2)', wait: 1600 },
]

export default function DatePickerDemo({
  mode = "single",
  disabled = false,
  readOnly = false,
  required = false,
  closeOnSelect = true,
  dismissible = true,
  showOutsideDays = true,
  side = "bottom",
  align = "start",
  presentation = "popover",
  months = 1,
  title = "The Old Bakery, Rye",
  subtitle = "Double room · €118 a night",
  label = "Check-in",
  width = 320,
  gap = 6,
  radius = 14,
  face = "",
  ink = "",
  accent = "",
}: {
  mode?: "single" | "range"
  disabled?: boolean
  readOnly?: boolean
  required?: boolean
  closeOnSelect?: boolean
  dismissible?: boolean
  showOutsideDays?: boolean
  side?: "bottom" | "top" | "left" | "right"
  align?: "start" | "center" | "end"
  presentation?: "popover" | "sheet" | "auto"
  months?: number
  title?: string
  subtitle?: string
  label?: string
  width?: number
  gap?: number
  radius?: number
  face?: string
  ink?: string
  accent?: string
}) {
  const preset = (date: string): string | [string, string] => mode === "range" ? [date, iso(new Date(Date.parse(`${date}T12:00:00`) + 86400000))] : date
  const theme = {
    "--date-picker-radius": `${radius}px`,
    ...(face ? { "--date-picker-face": face } : null),
    ...(ink ? { "--date-picker-ink": ink } : null),
    ...(accent ? { "--date-picker-accent": accent } : null),
  } as React.CSSProperties
  return (
    <div style={{ ...theme, maxWidth: width }} className="flex h-[440px] w-full flex-col">
      <div className="mb-4">
        <h3 className="text-[15px] font-semibold tracking-tight">{title}</h3>
        <p className="mt-1 text-[13px] text-muted-foreground">{subtitle}</p>
      </div>
      <label htmlFor="check-in" className="mb-1.5 text-[13px] font-medium">
        {label}
      </label>
      <DatePicker key={mode} mode={mode} months={months} disabled={disabled} readOnly={readOnly} required={required} closeOnSelect={closeOnSelect} dismissible={dismissible} showOutsideDays={showOutsideDays} presentation={presentation} defaultValue={preset(daysFromToday(3))} min={daysFromToday(0)} unavailable={[daysFromToday(9), daysFromToday(10)]}>
        <DatePickerField>
          <DatePickerInput id="check-in" />
          {mode === "range" && <><span aria-hidden>–</span><DatePickerInput end aria-label="Check-out" /></>}
          <DatePickerTrigger />
        </DatePickerField>
        <DatePickerHint>{(state) => `From 3 pm · like ${state.example}`}</DatePickerHint>
        <DatePickerContent style={theme} side={side} align={align} sideOffset={gap}>
          <CalendarHeader>
            <CalendarPrevious />
            <CalendarHeading />
            <CalendarNext />
          </CalendarHeader>
          <div className="flex gap-4">{Array.from({ length: months }, (_, offset) => <CalendarGrid key={offset} offset={offset} />)}</div>
          <div className="flex gap-1 border-t border-border pt-2">
            <DatePickerPreset value={preset(daysFromToday(0))}>Tonight</DatePickerPreset>
            <DatePickerPreset value={preset(daysFromToday(1))}>Tomorrow</DatePickerPreset>
            <DatePickerPreset value={preset(nextFriday())}>Friday</DatePickerPreset>
          </div>
        </DatePickerContent>
      </DatePicker>
    </div>
  )
}
