<script setup lang="ts">
import { NumberInput, NumberInputControl, NumberInputDecrement, NumberInputGroup, NumberInputIncrement } from "@/components/keyframery/number-input"
</script>

<template>
  <NumberInput :default-value="1" :min="0">
    <NumberInputGroup>
      <NumberInputDecrement aria-label="Decrease" />
      <NumberInputControl aria-label="Quantity" />
      <NumberInputIncrement aria-label="Increase" />
    </NumberInputGroup>
  </NumberInput>
</template>
