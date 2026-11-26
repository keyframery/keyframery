<script setup lang="ts">
// Icons and a clear button
// Put an icon in the control and `AutocompleteClear` after the input. `openOnFocus` shows the list before typing.

import { MapPin, Search } from "@lucide/vue"

import {
  Autocomplete,
  AutocompleteClear,
  AutocompleteContent,
  AutocompleteControl,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteItemIcon,
  AutocompleteItemText,
  AutocompleteList,
} from "@/components/keyframery/autocomplete"

const places = ["Covent Garden", "Camden Market", "Borough Market", "Greenwich Park", "Hampstead Heath"]
</script>

<template>
  <div class="w-full max-w-[300px]">
    <Autocomplete :items="places" open-on-focus auto-highlight>
      <AutocompleteControl>
        <Search />
        <AutocompleteInput type="search" aria-label="Search places" placeholder="Search places" />
        <AutocompleteClear aria-label="Clear" />
      </AutocompleteControl>
      <AutocompleteContent>
        <AutocompleteList v-slot="{ state }">
          <AutocompleteItem v-for="place in (state.items as string[])" :key="place" :value="place">
            <AutocompleteItemIcon>
              <MapPin />
            </AutocompleteItemIcon>
            <AutocompleteItemText />
          </AutocompleteItem>
        </AutocompleteList>
      </AutocompleteContent>
    </Autocomplete>
  </div>
</template>
