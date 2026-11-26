<script setup lang="ts">
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
} from "@/components/keyframery/date-picker"
</script>

<template>
  <DatePicker mode="range" :months="2" :default-value="['2026-07-08', '2026-07-12']">
    <DatePickerField class="w-full max-w-[320px]">
      <DatePickerInput aria-label="Check-in" />
      <span class="px-1 text-muted-foreground">–</span>
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
</template>
