<script setup lang="ts">
// Swatches
// `ColorPickerSwatches` offers a set of colours to choose from in one press.

import { ColorPicker, ColorPickerSwatches, ColorPickerSwatchItem } from "@/components/keyframery/color-picker"

const colours = ["#e5484d", "#f76b15", "#ffc53d", "#30a46c", "#0090ff", "#8e4ec6", "#1c2024"]
</script>

<template>
  <ColorPicker default-value="#30a46c" aria-label="Tag colour">
    <ColorPickerSwatches aria-label="Colours">
      <ColorPickerSwatchItem v-for="c in colours" :key="c" :value="c" />
    </ColorPickerSwatches>
  </ColorPicker>
</template>
