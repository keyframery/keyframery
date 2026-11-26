<script setup lang="ts">
// Stick to the end
// `stickToEnd` keeps a chat or a log at the newest line as it grows, unless you scroll up. `ScrollAreaScrollToEnd` brings you back.

import { ref } from "vue"

import { Button } from "@/components/keyframery/button"
import { ScrollArea, ScrollAreaContent, ScrollAreaScrollbar, ScrollAreaScrollToEnd, ScrollAreaThumb, ScrollAreaViewport } from "@/components/keyframery/scroll-area"

const lines = ref(Array.from({ length: 8 }, (_, i) => `Build step ${i + 1} done`))
</script>

<template>
  <div class="flex w-full max-w-[320px] flex-col gap-2">
    <ScrollArea stick-to-end class="h-[180px] rounded-[12px] border">
      <ScrollAreaViewport role="log" aria-label="Build log">
        <ScrollAreaContent class="p-3 font-mono text-[12px]">
          <div v-for="(line, i) in lines" :key="i">{{ line }}</div>
        </ScrollAreaContent>
      </ScrollAreaViewport>
      <ScrollAreaScrollbar>
        <ScrollAreaThumb />
      </ScrollAreaScrollbar>
      <ScrollAreaScrollToEnd />
    </ScrollArea>
    <Button size="sm" class="self-start" @click="lines = [...lines, `Build step ${lines.length + 1} done`]">Add a line</Button>
  </div>
</template>
