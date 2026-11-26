<script setup lang="ts">
// Inline completion
// `inlineComplete` fills in the rest of the first match as you type. Press Tab or the right arrow to accept it.

import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteControl,
  AutocompleteInput,
  AutocompleteItems,
  AutocompleteList,
} from "@/components/keyframery/autocomplete"

const tags = ["design", "design-system", "development", "documentation", "devops"]
</script>

<template>
  <div class="w-full max-w-[300px]">
    <Autocomplete :items="tags" inline-complete auto-highlight>
      <AutocompleteControl>
        <AutocompleteInput aria-label="Tag" placeholder="Type “de”" />
      </AutocompleteControl>
      <AutocompleteContent>
        <AutocompleteList v-slot="{ state }">
          <AutocompleteItems :items="state.items" />
        </AutocompleteList>
      </AutocompleteContent>
    </Autocomplete>
  </div>
</template>
