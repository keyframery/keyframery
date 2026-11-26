<script setup lang="ts">
/* Mirrors src/demos/time-input.tsx at its defaults. */
import { TimeInput } from "@kf/time-input"

const hours = [
  { day: "Mon – Fri", opens: "07:30", closes: "18:00" },
  { day: "Saturday", opens: "09:00", closes: "16:30" },
  { day: "Sunday", opens: "10:00", closes: "14:00" },
]
const theme = { "--time-input-height": "36px", "--time-input-radius": "10px", "--time-input-segment-radius": "6px" }
function focusInput(event: MouseEvent) {
  if (event.target instanceof HTMLInputElement) event.target.focus()
}
</script>

<template>
  <div :style="{ ...theme, maxWidth: '380px' }" class="w-full">
    <h3 class="text-[15px] font-semibold tracking-tight">Opening hours</h3>
    <p class="mt-1 text-[13px] text-muted-foreground">Little Fern Bakery</p>
    <div style="column-gap: 8px; row-gap: 10px" class="mt-5 grid grid-cols-[1fr_auto_auto_auto] items-center gap-x-2 gap-y-2.5 text-[13px]" @click="focusInput">
      <div v-for="row in hours" :key="row.day" class="contents">
        <span class="font-medium">{{ row.day }}</span>
        <TimeInput :hour-cycle="12" granularity="minute" :read-only="false" :required="false" :disabled="false" :default-value="row.opens" :aria-label="`${row.day} opens`" />
        <span class="text-muted-foreground">to</span>
        <TimeInput :hour-cycle="12" granularity="minute" :read-only="false" :required="false" :disabled="false" :default-value="row.closes" :min="row.opens" :aria-label="`${row.day} closes`" />
      </div>
      <span class="font-medium text-muted-foreground">Holidays</span>
      <TimeInput :hour-cycle="12" granularity="minute" :read-only="false" :required="false" :disabled="true" aria-label="Holidays opens" />
      <span class="text-muted-foreground">to</span>
      <TimeInput :hour-cycle="12" granularity="minute" :read-only="false" :required="false" :disabled="true" aria-label="Holidays closes" />
    </div>
  </div>
</template>
