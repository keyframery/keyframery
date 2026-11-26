<script setup lang="ts">
// Basic
// Type the hours and minutes, or step them with the arrow keys. The value is `"HH:mm"`.

import { ref } from "vue"

import { TimeInput } from "@/components/keyframery/time-input"

const time = ref<string | null>("08:30")
</script>

<template>
  <div class="flex flex-col gap-2">
    <TimeInput v-model:value="time" aria-label="Alarm" />
    <span class="text-[12px] text-muted-foreground tabular-nums">value: {{ time ?? 'null' }}</span>
  </div>
</template>
