<script setup lang="ts">
// Units
// `max` sets the range and `format` takes `Intl.NumberFormat` options, so the value reads in gigabytes.

import { ref } from "vue"

import { Button } from "@/components/keyframery/button"
import { Meter, MeterIndicator, MeterLabel, MeterTrack, MeterValue } from "@/components/keyframery/meter"

const gb = { style: "unit", unit: "gigabyte", maximumFractionDigits: 1 } as const

const used = ref(38.4)
</script>

<template>
  <div class="flex w-full max-w-[300px] flex-col gap-3">
    <Meter :value="used" :max="50" :format="gb">
      <MeterLabel>Used of 50 GB</MeterLabel>
      <MeterValue />
      <MeterTrack>
        <MeterIndicator />
      </MeterTrack>
    </Meter>
    <Button size="sm" class="self-start" @click="used = used > 30 ? 21.7 : 38.4">{{ used > 30 ? 'Clear the cache' : 'Undo' }}</Button>
  </div>
</template>
