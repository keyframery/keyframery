<script setup lang="ts">
import { Calendar, CalendarGrid, CalendarHeader, CalendarHeading, CalendarNext, CalendarPrevious } from "@/components/keyframery/calendar"
</script>

<template>
  <Calendar aria-label="Date">
    <CalendarHeader>
      <CalendarPrevious />
      <CalendarHeading />
      <CalendarNext />
    </CalendarHeader>
    <CalendarGrid />
  </Calendar>
</template>
