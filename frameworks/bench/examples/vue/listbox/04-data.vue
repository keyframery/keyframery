<script setup lang="ts">
// Items as data
// Pass `items` and leave the listbox empty: it renders the rows, groups and separators for you.

import { Listbox, type ListData } from "@/components/keyframery/listbox"

const items: ListData = [
  { type: "group", label: "Coast", items: ["Seven Sisters", "Durdle Door"] },
  { type: "separator" },
  { type: "group", label: "Lakes", items: ["Derwentwater", "Buttermere"] },
]
</script>

<template>
  <Listbox aria-label="Walks" :items="items" default-value="Derwentwater" class="w-full max-w-[260px]" />
</template>
