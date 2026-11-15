import * as React from "react"

import {
  Calendar,
  CalendarGrid,
  CalendarHeader,
  CalendarHeading,
  CalendarNext,
  CalendarPrevious,
} from "@/components/ui/calendar"

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

export default function CalendarDemo() {
  const [stay, setStay] = React.useState<[string, string] | null>(() => [
    daysFromToday(4),
    daysFromToday(8),
  ])
  const nights = stay ? nightsBetween(stay[0], stay[1]) : 0

  return (
    <Calendar
      mode="range"
      value={stay}
      onValueChange={(value) => setStay(value as [string, string] | null)}
      min={daysFromToday(0)}
      aria-label="Stay at Hollow Farm"
    >
      <CalendarHeader>
        <CalendarPrevious />
        <CalendarHeading />
        <CalendarNext />
      </CalendarHeader>
      <CalendarGrid />
      <div className="mt-1 flex items-baseline justify-between border-t border-border px-1.5 pt-3 pb-0.5 text-[13px]">
        <span className="font-medium tabular-nums">
          {stay ? `${label(stay[0])} to ${label(stay[1])}` : "Pick your dates"}
        </span>
        <span className="text-muted-foreground tabular-nums">
          {stay ? `${nights} ${nights === 1 ? "night" : "nights"}` : "Pick your dates"}
        </span>
      </div>
    </Calendar>
  )
}
