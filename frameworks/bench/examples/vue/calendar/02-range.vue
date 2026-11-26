<script setup lang="ts">
// Range
// `mode="range"` picks a start and an end. `minDays` and `maxDays` limit how long it can be.

import { Calendar } from "@/components/keyframery/calendar"
</script>

<template>
  <Calendar
    mode="range"
    default-month="2026-07-01"
    :default-value="['2026-07-08', '2026-07-12']"
    :min-days="2"
    aria-label="Stay"
  />
</template>
