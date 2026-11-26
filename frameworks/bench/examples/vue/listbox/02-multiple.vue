<script setup lang="ts">
// Several choices
// `multiple` toggles items. Shift and arrow keys extend the selection.

import { ref } from "vue"

import { Listbox, ListboxItem, ListboxItemIndicator } from "@/components/keyframery/listbox"

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

const picked = ref<string[]>(["Monday", "Thursday"])
</script>

<template>
  <div class="flex w-full max-w-[220px] flex-col gap-2">
    <Listbox v-model:value="picked" aria-label="Office days" multiple>
      <ListboxItem v-for="day in days" :key="day" :value="day">{{ day }}<ListboxItemIndicator /></ListboxItem>
    </Listbox>
    <span class="text-[12px] text-muted-foreground">{{ picked.length }} days a week</span>
  </div>
</template>
