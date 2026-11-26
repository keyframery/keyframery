<script setup lang="ts">
import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteControl,
  AutocompleteInput,
  AutocompleteItems,
  AutocompleteList,
} from "@/components/keyframery/autocomplete"

const cities = ["Amsterdam", "Berlin", "Lisbon"]
</script>

<template>
  <Autocomplete :items="cities">
    <AutocompleteControl>
      <AutocompleteInput placeholder="City" />
    </AutocompleteControl>
    <AutocompleteContent>
      <AutocompleteList v-slot="{ state }">
        <AutocompleteItems :items="state.items" />
      </AutocompleteList>
    </AutocompleteContent>
  </Autocomplete>
</template>
