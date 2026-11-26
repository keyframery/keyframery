<script setup lang="ts">
// Basic
// A measurement in a known range, like storage or battery. For a task that's under way, use Progress.

import { Meter, MeterIndicator, MeterLabel, MeterTrack, MeterValue } from "@/components/keyframery/meter"
</script>

<template>
  <Meter :value="72" class="w-full max-w-[300px]">
    <MeterLabel>Battery</MeterLabel>
    <MeterValue />
    <MeterTrack>
      <MeterIndicator />
    </MeterTrack>
  </Meter>
</template>
