<script setup lang="ts">
/* Mirrors src/demos/date-input.tsx at its defaults. */
import { computed, ref } from "vue"
import { DateInput } from "@kf/date-input"
import { iso } from "./util"

const today = new Date()
const sixMonthsOut = iso(new Date(today.getFullYear(), today.getMonth() + 6, today.getDate()))
const theme = { "--date-input-radius": "10px", "--date-input-height": "36px", "--date-input-font": "13px" }
const expiry = ref<string | null>("2031-08-09")
const tooSoon = computed(() => expiry.value !== null && expiry.value < sixMonthsOut)
function focusInput(event: MouseEvent) {
  if (event.target instanceof HTMLInputElement) event.target.focus()
}
</script>

<template>
  <div :style="{ ...theme, maxWidth: '340px' }" class="w-full">
    <h3 class="text-[15px] font-semibold tracking-tight">Passenger 1</h3>
    <p class="mt-1 text-[13px] text-muted-foreground">As shown on the passport</p>
    <div style="column-gap: 12px" class="mt-5 grid grid-cols-2 gap-x-3 gap-y-1.5" @click="focusInput">
      <span id="dob" class="text-[13px] font-medium">Date of birth</span>
      <span id="expiry" class="text-[13px] font-medium">Passport expires</span>
      <DateInput granularity="day" :disabled="false" :read-only="false" :required="false" aria-labelledby="dob" default-value="1991-04-23" :max="iso(today)" class="w-full" />
      <DateInput granularity="day" :disabled="false" :read-only="false" :required="false" aria-labelledby="expiry" :value="expiry"
        @value-change="(v: any) => (expiry = v)" :min="sixMonthsOut" class="w-full" />
      <span />
      <span :class="'text-[12px] ' + (tooSoon ? 'text-destructive' : 'text-muted-foreground')">{{ tooSoon ? "Must last 6 more months" : "Valid for this trip" }}</span>
    </div>
  </div>
</template>
