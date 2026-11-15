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

export default function DatePickerDemo() {
  return (
    <div className="flex h-[440px] w-[320px] flex-col">
      <div className="mb-4">
        <h3 className="text-[15px] font-semibold tracking-tight">The Old Bakery, Rye</h3>
        <p className="mt-1 text-[13px] text-muted-foreground">Double room · €118 a night</p>
      </div>
      <label htmlFor="check-in" className="mb-1.5 text-[13px] font-medium">
        Check-in
      </label>
      <DatePicker defaultValue={daysFromToday(3)} min={daysFromToday(0)} unavailable={[daysFromToday(9), daysFromToday(10)]}>
        <DatePickerField>
          <DatePickerInput id="check-in" />
          <DatePickerTrigger />
        </DatePickerField>
        <DatePickerHint>{(state) => `From 3 pm · like ${state.example}`}</DatePickerHint>
        <DatePickerContent align="start">
          <CalendarHeader>
            <CalendarPrevious />
            <CalendarHeading />
            <CalendarNext />
          </CalendarHeader>
          <CalendarGrid />
          <div className="flex gap-1 border-t border-border pt-2">
            <DatePickerPreset value={daysFromToday(0)}>Tonight</DatePickerPreset>
            <DatePickerPreset value={daysFromToday(1)}>Tomorrow</DatePickerPreset>
            <DatePickerPreset value={nextFriday()}>Friday</DatePickerPreset>
          </div>
        </DatePickerContent>
      </DatePicker>
    </div>
  )
}
