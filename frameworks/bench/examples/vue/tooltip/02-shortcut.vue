<script setup lang="ts">
// With a shortcut
// `shortcut` on the tooltip shows the keys with `TooltipShortcut` and presses the trigger when they're pressed.

import { Button } from "@/components/keyframery/button"
import { Tooltip, TooltipArrow, TooltipContent, TooltipShortcut, TooltipTrigger } from "@/components/keyframery/tooltip"
</script>

<template>
  <Tooltip shortcut="mod+s">
    <TooltipTrigger>
      <template #render="{ props }">
        <Button v-bind="props">Save</Button>
      </template>
    </TooltipTrigger>
    <TooltipContent><TooltipArrow />Save the draft<TooltipShortcut /></TooltipContent>
  </Tooltip>
</template>
