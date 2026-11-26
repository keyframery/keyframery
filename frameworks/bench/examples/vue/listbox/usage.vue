<script setup lang="ts">
import { Listbox, ListboxItem, ListboxItemIndicator } from "@/components/keyframery/listbox"
</script>

<template>
  <Listbox aria-label="Size" default-value="m">
    <ListboxItem value="s">Small<ListboxItemIndicator /></ListboxItem>
    <ListboxItem value="m">Medium<ListboxItemIndicator /></ListboxItem>
  </Listbox>
</template>
