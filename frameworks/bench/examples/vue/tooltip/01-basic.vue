<script setup lang="ts">
// Icon buttons
// A tooltip names a button that only shows an icon. Once one is open, the next opens at once as you move along.

import { Bell, Search, Settings } from "@lucide/vue"

import { Button } from "@/components/keyframery/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/keyframery/tooltip"

const items = [
  { label: "Search", icon: Search },
  { label: "Notifications", icon: Bell },
  { label: "Settings", icon: Settings },
]
</script>

<template>
  <div class="flex gap-1">
    <Tooltip v-for="item in items" :key="item.label">
      <TooltipTrigger>
        <template #render="{ props }">
          <Button v-bind="props" size="icon" variant="ghost" :aria-label="item.label">
            <component :is="item.icon" />
          </Button>
        </template>
      </TooltipTrigger>
      <TooltipContent>{{ item.label }}</TooltipContent>
    </Tooltip>
  </div>
</template>
