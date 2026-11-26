<script setup lang="ts">
// Drag the label to change it
// Wrap the label in `NumberInputScrubArea` and dragging it sideways changes the value, as in design tools.

import { NumberInput, NumberInputControl, NumberInputGroup, NumberInputScrubArea } from "@/components/keyframery/number-input"
</script>

<template>
  <NumberInput :default-value="24" :min="0" :max="200" class="w-[160px]">
    <NumberInputScrubArea :pixels-per-step="4">
      <span class="cursor-ew-resize text-[13px] font-medium">Corner radius</span>
    </NumberInputScrubArea>
    <NumberInputGroup>
      <NumberInputControl aria-label="Corner radius" />
    </NumberInputGroup>
  </NumberInput>
</template>
