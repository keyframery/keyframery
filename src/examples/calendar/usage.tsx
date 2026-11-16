import { Calendar, CalendarGrid, CalendarHeader, CalendarHeading, CalendarNext, CalendarPrevious } from "@/components/ui/calendar"

export default function Usage() {
  return (
    <Calendar aria-label="Date">
      <CalendarHeader>
        <CalendarPrevious />
        <CalendarHeading />
        <CalendarNext />
      </CalendarHeader>
      <CalendarGrid />
    </Calendar>
  )
}
