<script setup lang="ts">
// Limits
// `min` and `max` mark a date outside them as invalid, and the field says so.

import { DateInput } from "@/components/keyframery/date-input"
</script>

<template>
  <div class="flex flex-col gap-2">
    <span id="start-label" class="text-[13px] font-medium">Start date (2026 only)</span>
    <DateInput aria-labelledby="start-label" min="2026-01-01" max="2026-12-31" default-value="2027-01-05" />
  </div>
</template>
