<script setup lang="ts">
// Text on both sides
// Addons sit before (`inline-start`) or after (`inline-end`) the input. Pressing their text focuses it.

import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/keyframery/input-group"
</script>

<template>
  <InputGroup class="max-w-[320px]">
    <InputGroupAddon>
      <InputGroupText>https://</InputGroupText>
    </InputGroupAddon>
    <InputGroupInput aria-label="Shop address" default-value="fernandkiln" :spellcheck="false" />
    <InputGroupAddon align="inline-end">
      <InputGroupText>.shop</InputGroupText>
    </InputGroupAddon>
  </InputGroup>
</template>
