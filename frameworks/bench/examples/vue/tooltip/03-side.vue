<script setup lang="ts">
// Placement
// `side` picks where it appears. It flips when there isn't room.

import { Button } from "@/components/keyframery/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/keyframery/tooltip"
</script>

<template>
  <div class="flex flex-wrap justify-center gap-2">
    <Tooltip v-for="side in (['top', 'right', 'bottom', 'left'] as const)" :key="side" :delay="200">
      <TooltipTrigger>
        <template #render="{ props }">
          <Button v-bind="props" size="sm">{{ side }}</Button>
        </template>
      </TooltipTrigger>
      <TooltipContent :side="side">On the {{ side }}</TooltipContent>
    </Tooltip>
  </div>
</template>
