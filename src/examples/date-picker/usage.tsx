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

export default function Usage() {
  return (
    <DatePicker>
      <DatePickerField>
        <DatePickerInput aria-label="Date" />
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
