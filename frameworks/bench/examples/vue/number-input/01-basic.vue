<script setup lang="ts">
// Stepper
// Buttons, arrow keys and typing all change it, kept between `min` and `max`. Shift and arrow keys step by ten.

import { NumberInput, NumberInputControl, NumberInputDecrement, NumberInputGroup, NumberInputIncrement } from "@/components/keyframery/number-input"
</script>

<template>
  <NumberInput :default-value="2" :min="1" :max="8" class="w-[160px]">
    <NumberInputGroup>
      <NumberInputDecrement aria-label="One guest fewer" />
      <NumberInputControl aria-label="Guests" />
      <NumberInputIncrement aria-label="One more guest" />
    </NumberInputGroup>
  </NumberInput>
</template>
