<script setup lang="ts">
// Image
// The frame holds its shape before the photo arrives; `AspectRatioImage` fades it up out of a blur once it has loaded.

import { AspectRatio, AspectRatioImage } from "@/components/keyframery/aspect-ratio"
</script>

<template>
  <AspectRatio :ratio="4 / 3" class="max-w-[360px]">
    <AspectRatioImage src="/demo/canal.jpg" alt="Canal houses in the morning light" />
  </AspectRatio>
</template>
