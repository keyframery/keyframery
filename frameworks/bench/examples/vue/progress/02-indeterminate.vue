<script setup lang="ts">
// Indeterminate
// `value={null}` when you can't tell how long it will take. The bar sweeps until a value arrives.

import { Progress, ProgressIndicator, ProgressLabel, ProgressTrack } from "@/components/keyframery/progress"
</script>

<template>
  <Progress :value="null" class="w-full max-w-[300px]">
    <ProgressLabel>Preparing your export</ProgressLabel>
    <ProgressTrack>
      <ProgressIndicator />
    </ProgressTrack>
  </Progress>
</template>
