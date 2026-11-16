// Presets
// `DatePickerPreset` buttons set a common date in one press.
import {
  CalendarGrid,
  CalendarHeader,
  CalendarHeading,
  CalendarNext,
  CalendarPrevious,
  DatePicker,
  DatePickerContent,
  DatePickerField,
  DatePickerInput,
  DatePickerPreset,
  DatePickerTrigger,
} from "@/components/ui/date-picker"

/* Today plus n days, as an ISO date. */
const inDays = (n: number) => {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toLocaleDateString("sv")
}

export default function DatePickerPresets() {
  return (
    <DatePicker defaultValue={inDays(1)}>
      <DatePickerField className="w-full max-w-[260px]">
        <DatePickerInput aria-label="Remind me on" />
        <DatePickerTrigger />
      </DatePickerField>
      <DatePickerContent>
        <CalendarHeader>
          <CalendarPrevious />
          <CalendarHeading />
          <CalendarNext />
        </CalendarHeader>
        <CalendarGrid />
        <div className="flex gap-1 border-t border-border pt-2">
          <DatePickerPreset value={inDays(1)}>Tomorrow</DatePickerPreset>
          <DatePickerPreset value={inDays(7)}>In a week</DatePickerPreset>
          <DatePickerPreset value={inDays(30)}>In a month</DatePickerPreset>
        </div>
      </DatePickerContent>
    </DatePicker>
  )
}
