<script setup lang="ts">
import { ScrollArea, ScrollAreaContent, ScrollAreaScrollbar, ScrollAreaThumb, ScrollAreaViewport } from "@/components/keyframery/scroll-area"
</script>

<template>
  <ScrollArea class="h-48">
    <ScrollAreaViewport>
      <ScrollAreaContent>
        <!-- Long content -->
      </ScrollAreaContent>
    </ScrollAreaViewport>
    <ScrollAreaScrollbar>
      <ScrollAreaThumb />
    </ScrollAreaScrollbar>
  </ScrollArea>
</template>
