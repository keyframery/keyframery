<script setup lang="ts">
// Several values
// `multiple` keeps the list open and shows each pick as a chip. Backspace removes the last one.

import {
  Combobox,
  ComboboxChip,
  ComboboxChipRemove,
  ComboboxChips,
  ComboboxContent,
  ComboboxControl,
  ComboboxInput,
  ComboboxItems,
  ComboboxList,
  ComboboxValue,
} from "@/components/keyframery/combobox"

const skills = ["React", "TypeScript", "CSS", "Node.js", "Design systems", "Accessibility", "Testing"]
</script>

<template>
  <div class="w-full max-w-[340px]">
    <Combobox :items="skills" multiple :default-value="['React', 'CSS']">
      <ComboboxControl>
        <ComboboxChips>
          <ComboboxValue v-slot="{ state }">
            <ComboboxChip v-for="skill in (state.value as string[])" :key="skill" :value="skill">
              {{ skill }}<ComboboxChipRemove :aria-label="`Remove ${skill}`" />
            </ComboboxChip>
          </ComboboxValue>
          <ComboboxInput aria-label="Skills" placeholder="Add a skill" />
        </ComboboxChips>
      </ComboboxControl>
      <ComboboxContent>
        <ComboboxList v-slot="{ state }">
          <ComboboxItems :items="state.items" />
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  </div>
</template>
