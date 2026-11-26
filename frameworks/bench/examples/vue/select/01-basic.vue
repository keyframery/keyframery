<script setup lang="ts">
// Basic
// With a label, a placeholder and a check on the chosen item.

import { Select, SelectContent, SelectItem, SelectItemIndicator, SelectItemText, SelectLabel, SelectTrigger, SelectValue } from "@/components/keyframery/select"

const fruits = ["Apple", "Banana", "Blueberry", "Grapes", "Pineapple"]
</script>

<template>
  <div class="w-full max-w-[220px]">
    <Select placeholder="Pick a fruit">
      <SelectLabel>Fruit</SelectLabel>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem v-for="fruit in fruits" :key="fruit" :value="fruit">
          <SelectItemText>{{ fruit }}</SelectItemText>
          <SelectItemIndicator />
        </SelectItem>
      </SelectContent>
    </Select>
  </div>
</template>
