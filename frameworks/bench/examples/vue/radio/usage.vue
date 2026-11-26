<script setup lang="ts">
import { Radio, RadioGroup } from "@/components/keyframery/radio"
</script>

<template>
  <RadioGroup aria-label="Size" default-value="m">
    <label><Radio value="s" /> Small</label>
    <label><Radio value="m" /> Medium</label>
  </RadioGroup>
</template>
