<script setup lang="ts">
import { Progress, ProgressIndicator, ProgressLabel, ProgressTrack, ProgressValue } from "@/components/keyframery/progress"
</script>

<template>
  <Progress :value="40">
    <ProgressLabel>Uploading</ProgressLabel>
    <ProgressValue />
    <ProgressTrack>
      <ProgressIndicator />
    </ProgressTrack>
  </Progress>
</template>
