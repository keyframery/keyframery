// Range
// `mode="range"` takes two inputs: mark the second one `end`. Two months show side by side.
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
  DatePickerTrigger,
} from "@/components/ui/date-picker"

export default function DatePickerRange() {
  return (
    <DatePicker mode="range" months={2} defaultValue={["2026-07-08", "2026-07-12"]}>
      <DatePickerField className="w-full max-w-[320px]">
        <DatePickerInput aria-label="Check-in" />
        <span className="px-1 text-muted-foreground">–</span>
        <DatePickerInput end aria-label="Check-out" />
        <DatePickerTrigger />
      </DatePickerField>
      <DatePickerContent>
        <CalendarHeader>
          <CalendarPrevious />
          <CalendarHeading />
          <CalendarNext />
        </CalendarHeader>
        <CalendarGrid />
      </DatePickerContent>
    </DatePicker>
  )
}
