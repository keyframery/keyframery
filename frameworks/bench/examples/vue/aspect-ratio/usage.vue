<script setup lang="ts">
import { AspectRatio, AspectRatioImage } from "@/components/keyframery/aspect-ratio"
</script>

<template>
  <AspectRatio :ratio="16 / 9">
    <AspectRatioImage src="/demo/coast-1.jpg" alt="A cove at low tide" />
  </AspectRatio>
</template>
