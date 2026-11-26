<script setup lang="ts">
import {
  ColorPicker,
  ColorPickerArea,
  ColorPickerAreaThumb,
  ColorPickerInput,
  ColorPickerSlider,
  ColorPickerSliderThumb,
} from "@/components/keyframery/color-picker"
</script>

<template>
  <ColorPicker default-value="#0090ff" aria-label="Colour">
    <ColorPickerArea>
      <ColorPickerAreaThumb />
    </ColorPickerArea>
    <ColorPickerSlider channel="hue">
      <ColorPickerSliderThumb />
    </ColorPickerSlider>
    <ColorPickerInput aria-label="Hex" />
  </ColorPicker>
</template>
