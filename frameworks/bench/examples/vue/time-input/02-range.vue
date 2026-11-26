<script setup lang="ts">
// Opening hours
// `hourCycle={12}` shows AM and PM. `min` on the closing time keeps it after the opening time.

import { TimeInput } from "@/components/keyframery/time-input"
</script>

<template>
  <div class="flex items-center gap-2 text-[13px]">
    <TimeInput :hour-cycle="12" default-value="08:00" aria-label="Opens" />
    <span class="text-muted-foreground">to</span>
    <TimeInput :hour-cycle="12" default-value="17:30" min="08:00" aria-label="Closes" />
  </div>
</template>
