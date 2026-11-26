<script setup lang="ts">
// Groups
// Pass groups as data, or write `ComboboxGroup` and `ComboboxGroupLabel` yourself.

import {
  Combobox,
  ComboboxContent,
  ComboboxControl,
  ComboboxInput,
  ComboboxItems,
  ComboboxList,
  ComboboxTrigger,
} from "@/components/keyframery/combobox"

const foods = [
  { type: "group" as const, label: "Fruit", items: ["Apple", "Banana", "Mango"] },
  { type: "group" as const, label: "Vegetables", items: ["Carrot", "Leek", "Spinach"] },
]
</script>

<template>
  <div class="w-full max-w-[280px]">
    <Combobox :items="foods">
      <ComboboxControl>
        <ComboboxInput aria-label="Food" placeholder="Pick a food" />
        <ComboboxTrigger aria-label="Show foods" />
      </ComboboxControl>
      <ComboboxContent>
        <ComboboxList v-slot="{ state }">
          <ComboboxItems :items="state.items" />
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  </div>
</template>
