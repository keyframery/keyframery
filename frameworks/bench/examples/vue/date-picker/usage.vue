<script setup lang="ts">
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
} from "@/components/keyframery/date-picker"
</script>

<template>
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
</template>
