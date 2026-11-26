<script setup lang="ts">
// Sideways
// Add a horizontal scrollbar for wide content, like a row of photos.

import { ScrollArea, ScrollAreaContent, ScrollAreaScrollbar, ScrollAreaThumb, ScrollAreaViewport } from "@/components/keyframery/scroll-area"

const photos = ["coast-1", "coast-2", "coast-3", "coast-4", "coast-5", "lake"]
</script>

<template>
  <ScrollArea class="w-full max-w-[400px] rounded-[12px] border">
    <ScrollAreaViewport role="region" aria-label="Photos">
      <ScrollAreaContent class="flex w-max gap-3 p-3">
        <img
          v-for="name in photos"
          :key="name"
          :src="`/demo/${name}.jpg`"
          alt=""
          class="h-28 w-40 shrink-0 rounded-[10px] bg-muted object-cover"
        />
      </ScrollAreaContent>
    </ScrollAreaViewport>
    <ScrollAreaScrollbar orientation="horizontal">
      <ScrollAreaThumb />
    </ScrollAreaScrollbar>
  </ScrollArea>
</template>
