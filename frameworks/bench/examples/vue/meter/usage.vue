<script setup lang="ts">
import { Meter, MeterIndicator, MeterLabel, MeterTrack, MeterValue } from "@/components/keyframery/meter"
</script>

<template>
  <Meter :value="64">
    <MeterLabel>Battery</MeterLabel>
    <MeterValue />
    <MeterTrack>
      <MeterIndicator />
    </MeterTrack>
  </Meter>
</template>
