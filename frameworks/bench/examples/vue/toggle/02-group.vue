<script setup lang="ts">
// Group
// `ToggleGroup` with `multiple` for formatting. Without it, one at a time, like alignment.

import { AlignCenter, AlignLeft, AlignRight, Bold, Italic, Underline } from "@lucide/vue"

import { Toggle, ToggleGroup, ToggleIcon } from "@/components/keyframery/toggle"
</script>

<template>
  <div class="flex flex-wrap gap-3">
    <ToggleGroup multiple aria-label="Text style" :default-value="['bold']">
      <Toggle value="bold" size="icon" aria-label="Bold">
        <ToggleIcon>
          <Bold />
        </ToggleIcon>
      </Toggle>
      <Toggle value="italic" size="icon" aria-label="Italic">
        <ToggleIcon>
          <Italic />
        </ToggleIcon>
      </Toggle>
      <Toggle value="underline" size="icon" aria-label="Underline">
        <ToggleIcon>
          <Underline />
        </ToggleIcon>
      </Toggle>
    </ToggleGroup>
    <ToggleGroup aria-label="Alignment" :default-value="['left']" :deselectable="false">
      <Toggle value="left" size="icon" aria-label="Left">
        <AlignLeft />
      </Toggle>
      <Toggle value="center" size="icon" aria-label="Centre">
        <AlignCenter />
      </Toggle>
      <Toggle value="right" size="icon" aria-label="Right">
        <AlignRight />
      </Toggle>
    </ToggleGroup>
  </div>
</template>
