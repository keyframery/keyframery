<script setup lang="ts">
// Basic
// Native scrolling with a slim scrollbar that shows while you scroll or hover.

import { ScrollArea, ScrollAreaContent, ScrollAreaScrollbar, ScrollAreaThumb, ScrollAreaViewport } from "@/components/keyframery/scroll-area"

const tags = Array.from({ length: 40 }, (_, i) => `v1.${40 - i}.0`)
</script>

<template>
  <ScrollArea class="h-[220px] w-full max-w-[240px] rounded-[12px] border">
    <ScrollAreaViewport role="region" aria-label="Releases">
      <ScrollAreaContent>
        <ul class="p-2">
          <li
            v-for="tag in tags"
            :key="tag"
            class="border-b border-border px-2 py-2 text-[13px] tabular-nums last:border-0"
          >
            {{ tag }}
          </li>
        </ul>
      </ScrollAreaContent>
    </ScrollAreaViewport>
    <ScrollAreaScrollbar>
      <ScrollAreaThumb />
    </ScrollAreaScrollbar>
  </ScrollArea>
</template>
