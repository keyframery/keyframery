<script setup lang="ts">
// On and off
// A button that stays pressed. `ToggleIcon` animates the icon as it turns on.

import { Pin, Star } from "@lucide/vue"

import { Toggle, ToggleIcon } from "@/components/keyframery/toggle"
</script>

<template>
  <div class="flex gap-2">
    <Toggle default-pressed>
      <ToggleIcon>
        <Pin />
      </ToggleIcon>
      Pinned
    </Toggle>
    <Toggle size="icon" aria-label="Favourite">
      <ToggleIcon>
        <Star />
      </ToggleIcon>
    </Toggle>
  </div>
</template>
