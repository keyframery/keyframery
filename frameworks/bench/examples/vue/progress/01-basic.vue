<script setup lang="ts">
// Basic
// The bar eases to each new value, and the number rolls with it.

import { ref } from "vue"

import { Button } from "@/components/keyframery/button"
import { Progress, ProgressIndicator, ProgressLabel, ProgressTrack, ProgressValue } from "@/components/keyframery/progress"

const value = ref(30)
</script>

<template>
  <div class="flex w-full max-w-[300px] flex-col gap-3">
    <Progress :value="value">
      <ProgressLabel>Uploading photos</ProgressLabel>
      <ProgressValue />
      <ProgressTrack>
        <ProgressIndicator />
      </ProgressTrack>
    </Progress>
    <Button size="sm" class="self-start" @click="value = value >= 100 ? 0 : value + 25">{{ value >= 100 ? 'Start again' : 'Add 25%' }}</Button>
  </div>
</template>
