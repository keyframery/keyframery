<script setup lang="ts">
// Basic
// Type the date in the order of the reader's locale. Arrow keys step each part, and the value is an ISO string.

import { ref } from "vue"

import { DateInput } from "@/components/keyframery/date-input"

const date = ref<string | null>("1990-04-23")
</script>

<template>
  <div class="flex flex-col gap-2">
    <span id="dob-label" class="text-[13px] font-medium">Date of birth</span>
    <DateInput v-model:value="date" aria-labelledby="dob-label" />
    <span class="text-[12px] text-muted-foreground tabular-nums">value: {{ date ?? 'null' }}</span>
  </div>
</template>
