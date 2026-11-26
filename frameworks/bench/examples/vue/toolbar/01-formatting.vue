<script setup lang="ts">
// Formatting bar
// One Tab stop for the whole bar; arrow keys move between its controls. Toggle groups hold on and off states.

import { AlignCenter, AlignLeft, AlignRight, Bold, Italic, Redo2, Underline, Undo2 } from "@lucide/vue"

import { Toolbar, ToolbarButton, ToolbarSeparator, ToolbarToggle, ToolbarToggleGroup } from "@/components/keyframery/toolbar"
</script>

<template>
  <Toolbar aria-label="Formatting">
    <ToolbarButton aria-label="Undo">
      <Undo2 />
    </ToolbarButton>
    <ToolbarButton aria-label="Redo" disabled>
      <Redo2 />
    </ToolbarButton>
    <ToolbarSeparator />
    <ToolbarToggleGroup multiple :default-value="['bold']" aria-label="Text style">
      <ToolbarToggle value="bold" aria-label="Bold">
        <Bold />
      </ToolbarToggle>
      <ToolbarToggle value="italic" aria-label="Italic">
        <Italic />
      </ToolbarToggle>
      <ToolbarToggle value="underline" aria-label="Underline">
        <Underline />
      </ToolbarToggle>
    </ToolbarToggleGroup>
    <ToolbarSeparator />
    <ToolbarToggleGroup :default-value="['left']" :deselectable="false" aria-label="Alignment">
      <ToolbarToggle value="left" aria-label="Left">
        <AlignLeft />
      </ToolbarToggle>
      <ToolbarToggle value="center" aria-label="Centre">
        <AlignCenter />
      </ToolbarToggle>
      <ToolbarToggle value="right" aria-label="Right">
        <AlignRight />
      </ToolbarToggle>
    </ToolbarToggleGroup>
  </Toolbar>
</template>
