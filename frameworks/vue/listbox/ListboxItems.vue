<script setup lang="ts">
/* Renders items passed as data with the styled parts. */
import type { ListData } from "@ui-sdk/vue/listbox"
import ListboxGroup from "./ListboxGroup.vue"
import ListboxGroupLabel from "./ListboxGroupLabel.vue"
import ListboxItem from "./ListboxItem.vue"
import ListboxItemIndicator from "./ListboxItemIndicator.vue"
import ListboxItems from "./ListboxItems.vue"
import ListboxSeparator from "./ListboxSeparator.vue"

const props = defineProps<{ items?: ListData<unknown> }>()
const kind = (entry: any) => (typeof entry === "string" ? "string" : entry.type === "separator" ? "separator" : entry.type === "group" ? "group" : "item")
const keyOf = (entry: any, index: number) =>
  typeof entry === "string" ? entry : entry.type === "separator" ? `separator-${index}` : entry.type === "group" ? `group-${entry.label ?? index}` : typeof entry.value === "string" ? entry.value : index
</script>

<template>
  <template v-for="(entry, index) in (props.items ?? []) as any[]" :key="keyOf(entry, index)">
    <ListboxItem v-if="kind(entry) === 'string'" :value="entry">{{ entry }}<ListboxItemIndicator /></ListboxItem>
    <ListboxSeparator v-else-if="kind(entry) === 'separator'" />
    <ListboxGroup v-else-if="kind(entry) === 'group'">
      <ListboxGroupLabel v-if="entry.label">{{ entry.label }}</ListboxGroupLabel>
      <ListboxItems :items="entry.items" />
    </ListboxGroup>
    <ListboxItem v-else :value="entry.value" :label="entry.label" :disabled="entry.disabled">{{ entry.label }}<ListboxItemIndicator /></ListboxItem>
  </template>
</template>
