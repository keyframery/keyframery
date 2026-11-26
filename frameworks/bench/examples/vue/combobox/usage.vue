<script setup lang="ts">
import {
  Combobox,
  ComboboxContent,
  ComboboxControl,
  ComboboxInput,
  ComboboxItems,
  ComboboxList,
  ComboboxTrigger,
} from "@/components/keyframery/combobox"

const fruits = ["Apple", "Banana", "Cherry"]
</script>

<template>
  <Combobox :items="fruits">
    <ComboboxControl>
      <ComboboxInput placeholder="Fruit" />
      <ComboboxTrigger aria-label="Show fruit" />
    </ComboboxControl>
    <ComboboxContent>
      <ComboboxList v-slot="{ state }">
        <ComboboxItems :items="state.items" />
      </ComboboxList>
    </ComboboxContent>
  </Combobox>
</template>
