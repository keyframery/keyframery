<script setup lang="ts">
// In a popover
// Wrap the parts in `ColorPickerPopover`. The trigger shows the current colour with `ColorPickerSwatch`.

import { ref } from "vue"

import {
  ColorPicker,
  ColorPickerArea,
  ColorPickerAreaThumb,
  ColorPickerContent,
  ColorPickerInput,
  ColorPickerPopover,
  ColorPickerSlider,
  ColorPickerSliderThumb,
  ColorPickerSwatch,
  ColorPickerTrigger,
} from "@/components/keyframery/color-picker"

const color = ref("#0090ff")
</script>

<template>
  <ColorPicker v-model:value="color" format="hex" aria-label="Label colour">
    <ColorPickerPopover>
      <ColorPickerTrigger aria-label="Change colour">
        <ColorPickerSwatch />
        <span class="tabular-nums uppercase">{{ color }}</span>
      </ColorPickerTrigger>
      <ColorPickerContent>
        <ColorPickerArea>
          <ColorPickerAreaThumb />
        </ColorPickerArea>
        <ColorPickerSlider channel="hue">
          <ColorPickerSliderThumb />
        </ColorPickerSlider>
        <ColorPickerInput aria-label="Hex" class="uppercase" />
      </ColorPickerContent>
    </ColorPickerPopover>
  </ColorPicker>
</template>
