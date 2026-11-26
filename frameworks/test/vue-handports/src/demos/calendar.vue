<script setup lang="ts">
/* Mirrors src/demos/calendar.tsx at its defaults (range, one month). */
import { computed, ref } from "vue"
import { Calendar, CalendarGrid, CalendarHeader, CalendarHeading, CalendarNext, CalendarPrevious } from "@kf/calendar"
import { daysFromToday } from "./util"

const dayMonth = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" })
const label = (date: string) => dayMonth.format(new Date(`${date}T00:00:00Z`))
const nightsBetween = (from: string, to: string) => Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86400000)
const stay = ref<[string, string] | null>([daysFromToday(4), daysFromToday(8)])
const nights = computed(() => (stay.value ? nightsBetween(stay.value[0], stay.value[1]) : 0))
const theme = { "--calendar-size": "32px", "--calendar-radius": "14px", "--calendar-gap": "2px" }
</script>

<template>
  <Calendar mode="range" :value="stay" @value-change="(v: any) => (stay = v)" :style="theme" page-by="month" weekday-format="short"
    month-format="long" :months="1" :min="daysFromToday(0)" :show-outside-days="true" aria-label="Stay at Hollow Farm">
    <CalendarHeader>
      <CalendarPrevious />
      <CalendarHeading />
      <CalendarNext />
    </CalendarHeader>
    <div class="flex gap-4"><CalendarGrid :offset="0" /></div>
    <div class="mt-1 flex items-baseline justify-between border-t border-border px-1.5 pt-3 pb-0.5 text-[13px]">
      <span class="font-medium tabular-nums">{{ stay ? `${label(stay[0])} to ${label(stay[1])}` : "Pick your dates" }}</span>
      <span class="text-muted-foreground tabular-nums">{{ stay ? `${nights} ${nights === 1 ? "night" : "nights"}` : "Pick your dates" }}</span>
    </div>
  </Calendar>
</template>
