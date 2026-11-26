<script setup lang="ts">
// Groups
// `ListboxGroup` and `ListboxGroupLabel` split a long list into sections.

import { Listbox, ListboxGroup, ListboxGroupLabel, ListboxItem, ListboxItemIndicator, ListboxSeparator } from "@/components/keyframery/listbox"
</script>

<template>
  <Listbox aria-label="Font" default-value="Inter" class="w-full max-w-[220px]">
    <ListboxGroup>
      <ListboxGroupLabel>Sans serif</ListboxGroupLabel>
      <ListboxItem v-for="font in ['Inter', 'Helvetica']" :key="font" :value="font">
        {{ font }}<ListboxItemIndicator />
      </ListboxItem>
    </ListboxGroup>
    <ListboxSeparator />
    <ListboxGroup>
      <ListboxGroupLabel>Serif</ListboxGroupLabel>
      <ListboxItem v-for="font in ['Georgia', 'Garamond']" :key="font" :value="font">
        {{ font }}<ListboxItemIndicator />
      </ListboxItem>
    </ListboxGroup>
  </Listbox>
</template>
