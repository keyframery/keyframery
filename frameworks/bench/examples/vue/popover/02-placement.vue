<script setup lang="ts">
// Placement
// `side` and `align` choose where it opens. It flips by itself when there isn't room.

import { Popover, PopoverContent, PopoverTrigger } from "@/components/keyframery/popover"
</script>

<template>
  <div class="flex flex-wrap justify-center gap-2">
    <Popover v-for="side in (['top', 'right', 'bottom', 'left'] as const)" :key="side">
      <PopoverTrigger>{{ side }}</PopoverTrigger>
      <PopoverContent :side="side" class="text-[13px]">Opened on the {{ side }}.</PopoverContent>
    </Popover>
  </div>
</template>
