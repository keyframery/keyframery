// Basic
// Type a date or pick one from the calendar. The hint shows the format the field expects.
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
  DatePickerTrigger,
} from "@/components/ui/date-picker"

export default function DatePickerBasic() {
  return (
    <div className="flex w-full max-w-[280px] flex-col gap-1.5">
      <label htmlFor="due" className="text-[13px] font-medium">
        Due date
      </label>
      <DatePicker>
        <DatePickerField>
          <DatePickerInput id="due" />
          <DatePickerTrigger />
        </DatePickerField>
        <DatePickerHint>{(state) => `Like ${state.example}`}</DatePickerHint>
        <DatePickerContent>
          <CalendarHeader>
            <CalendarPrevious />
            <CalendarHeading />
            <CalendarNext />
          </CalendarHeader>
          <CalendarGrid />
        </DatePickerContent>
      </DatePicker>
    </div>
  )
}
