<script setup lang="ts">
// Two months
// `months={2}` shows two side by side. Without children, the calendar lays out its header and a grid for each month.

import { Calendar } from "@/components/keyframery/calendar"
</script>

<template>
  <Calendar mode="range" :months="2" aria-label="Trip dates" />
</template>
