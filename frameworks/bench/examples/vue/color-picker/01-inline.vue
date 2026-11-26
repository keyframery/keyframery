<script setup lang="ts">
// Inline
// The area picks saturation and brightness, the slider picks hue, and the input takes a hex value.

import {
  ColorPicker,
  ColorPickerArea,
  ColorPickerAreaThumb,
  ColorPickerEyeDropper,
  ColorPickerInput,
  ColorPickerSlider,
  ColorPickerSliderThumb,
} from "@/components/keyframery/color-picker"
</script>

<template>
  <ColorPicker default-value="#7c5cff" format="hex" aria-label="Accent colour" class="w-[240px]">
    <ColorPickerArea>
      <ColorPickerAreaThumb />
    </ColorPickerArea>
    <ColorPickerSlider channel="hue">
      <ColorPickerSliderThumb />
    </ColorPickerSlider>
    <div class="flex items-center gap-2">
      <ColorPickerInput aria-label="Hex" class="uppercase" />
      <ColorPickerEyeDropper aria-label="Pick from screen" />
    </div>
  </ColorPicker>
</template>
