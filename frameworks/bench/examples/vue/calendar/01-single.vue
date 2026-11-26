<script setup lang="ts">
// One date
// Dates are ISO strings, like `"2026-06-12"`, so they need no conversion to store or send.

import { ref } from "vue"

import { Calendar, CalendarGrid, CalendarHeader, CalendarHeading, CalendarNext, CalendarPrevious } from "@/components/keyframery/calendar"

const date = ref<string | null>(null)
</script>

<template>
  <div class="flex flex-col items-center gap-3">
    <Calendar v-model:value="date" aria-label="Delivery date">
      <CalendarHeader>
        <CalendarPrevious />
        <CalendarHeading />
        <CalendarNext />
      </CalendarHeader>
      <CalendarGrid />
    </Calendar>
    <span class="text-[13px] text-muted-foreground tabular-nums">{{ date ?? 'No date picked' }}</span>
  </div>
</template>
