<script setup lang="ts">
/* Mirrors src/demos/date-picker.tsx at its defaults (single, one month). */
import {
  CalendarGrid, CalendarHeader, CalendarHeading, CalendarNext, CalendarPrevious, DatePicker, DatePickerContent,
  DatePickerField, DatePickerHint, DatePickerInput, DatePickerPreset, DatePickerTrigger,
} from "@kf/date-picker"
import { daysFromToday, nextFriday } from "./util"

const theme = { "--date-picker-radius": "14px" }
</script>

<template>
  <div :style="{ ...theme, maxWidth: '320px' }" class="flex h-[440px] w-full flex-col">
    <div class="mb-4">
      <h3 class="text-[15px] font-semibold tracking-tight">The Old Bakery, Rye</h3>
      <p class="mt-1 text-[13px] text-muted-foreground">Double room · €118 a night</p>
    </div>
    <label for="check-in" class="mb-1.5 text-[13px] font-medium">Check-in</label>
    <DatePicker mode="single" :months="1" :disabled="false" :read-only="false" :required="false" :close-on-select="true" :dismissible="true"
      :show-outside-days="true" presentation="auto" :default-value="daysFromToday(3)" :min="daysFromToday(0)" :unavailable="[daysFromToday(9), daysFromToday(10)]">
      <DatePickerField>
        <DatePickerInput id="check-in" />
        <DatePickerTrigger />
      </DatePickerField>
      <DatePickerHint v-slot="{ state }">From 3 pm · like {{ state.example }}</DatePickerHint>
      <DatePickerContent :style="theme" side="bottom" align="start" :side-offset="6">
        <CalendarHeader>
          <CalendarPrevious />
          <CalendarHeading />
          <CalendarNext />
        </CalendarHeader>
        <div class="flex gap-4"><CalendarGrid :offset="0" /></div>
        <div class="flex gap-1 border-t border-border pt-2">
          <DatePickerPreset :value="daysFromToday(0)">Tonight</DatePickerPreset>
          <DatePickerPreset :value="daysFromToday(1)">Tomorrow</DatePickerPreset>
          <DatePickerPreset :value="nextFriday()">Friday</DatePickerPreset>
        </div>
      </DatePickerContent>
    </DatePicker>
  </div>
</template>
