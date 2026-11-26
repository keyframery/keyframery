<script setup lang="ts">
// Any content
// The frame keeps anything at its ratio, like an embedded video or a map. Fill it with `absolute inset-0`.

import { AspectRatio } from "@/components/keyframery/aspect-ratio"
</script>

<template>
  <AspectRatio :ratio="16 / 9" class="max-w-[420px]">
    <video class="absolute inset-0 size-full object-cover" poster="/demo/coast-5.jpg" controls muted />
  </AspectRatio>
</template>
