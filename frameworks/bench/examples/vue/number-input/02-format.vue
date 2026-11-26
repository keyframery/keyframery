<script setup lang="ts">
// Currency and percent
// `format` takes `Intl.NumberFormat` options. People type a plain number; the field shows it formatted.

import { NumberInput, NumberInputControl, NumberInputGroup } from "@/components/keyframery/number-input"
</script>

<template>
  <div class="flex w-full max-w-[300px] flex-col gap-3">
    <NumberInput :default-value="1250" :min="0" :format="{ style: 'currency', currency: 'EUR' }">
      <NumberInputGroup>
        <NumberInputControl aria-label="Budget" />
      </NumberInputGroup>
    </NumberInput>
    <NumberInput :default-value="0.2" :min="0" :max="1" :format="{ style: 'percent' }">
      <NumberInputGroup>
        <NumberInputControl aria-label="Discount" />
      </NumberInputGroup>
    </NumberInput>
  </div>
</template>
