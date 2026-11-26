<script setup lang="ts">
// Read the value
// `usePreference` gives a component the current value, so it can render differently, not only restyle.

import { createPreference } from "@ui-sdk/core"

import { Preferences, PreferenceSwitcher, usePreference } from "@/components/keyframery/preferences"

const units = createPreference({
  values: ["km", "miles"],
  defaultValue: "km",
  attribute: "data-units",
})

const walks = [
  { name: "Seven Sisters cliff path", km: 22 },
  { name: "Derwentwater loop", km: 16 },
]

const unit = usePreference(units)
const distance = (km: number) => (unit.value.value === "km" ? `${km} km` : `${(km * 0.621).toFixed(1)} mi`)
</script>

<template>
  <Preferences :preferences="[units]">
    <div class="flex w-full max-w-[300px] flex-col gap-3 text-[13.5px]">
      <PreferenceSwitcher :preference="units" :labels="{ km: 'Kilometres', miles: 'Miles' }" aria-label="Units" />
      <div v-for="walk in walks" :key="walk.name" class="flex items-center justify-between gap-3">
        <span>{{ walk.name }}</span>
        <span class="text-muted-foreground tabular-nums">{{ distance(walk.km) }}</span>
      </div>
    </div>
  </Preferences>
</template>
