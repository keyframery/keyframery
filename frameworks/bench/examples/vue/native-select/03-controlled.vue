<script setup lang="ts">
// Controlled and invalid
// Pass `value` and `onValueChange` to own the choice, and `invalid` to mark it wrong. A change from code moves like a pick.

import { ref } from "vue"

import { Button } from "@/components/keyframery/button"
import { NativeSelect, NativeSelectOption } from "@/components/keyframery/native-select"

const seat = ref("aisle")
</script>

<template>
  <div class="flex flex-col items-start gap-3">
    <NativeSelect v-model:value="seat" aria-label="Seat" :invalid="seat === 'exit'">
      <NativeSelectOption value="window">Window</NativeSelectOption>
      <NativeSelectOption value="aisle">Aisle</NativeSelectOption>
      <NativeSelectOption value="exit">Exit row</NativeSelectOption>
    </NativeSelect>
    <Button size="sm" @click="seat = 'window'">Pick a window seat</Button>
  </div>
</template>
