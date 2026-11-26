<script setup lang="ts">
// With a time
// `granularity="minute"` adds hours and minutes. `hourCycle` picks 12 or 24 hours.

import { DateInput } from "@/components/keyframery/date-input"
</script>

<template>
  <div class="flex flex-col gap-2">
    <span id="departs-label" class="text-[13px] font-medium">Departs</span>
    <DateInput aria-labelledby="departs-label" granularity="minute" default-value="2026-08-14T07:40" />
  </div>
</template>
