<script setup lang="ts">
/* @@BANNER
   Renders items passed as data with the styled parts, like React's SelectItems: strings, groups,
   separators and { value, label, disabled } objects. */
import type { ListData } from "@ui-sdk/vue/select"
import SelectGroup from "./SelectGroup.vue"
import SelectGroupLabel from "./SelectGroupLabel.vue"
import SelectItem from "./SelectItem.vue"
import SelectItemIndicator from "./SelectItemIndicator.vue"
import SelectItemText from "./SelectItemText.vue"
import SelectSeparator from "./SelectSeparator.vue"

defineOptions({ name: "SelectItems" })
const props = defineProps<{ items?: ListData<any> }>()
const list = (items: ListData<any> | undefined) => (items ?? []) as any[]
const keyOf = (entry: any, index: number) =>
  typeof entry === "string" ? entry : entry.type === "separator" ? `separator-${index}` : entry.type === "group" ? `group-${entry.label ?? index}` : typeof entry.value === "string" ? entry.value : index
</script>

<template>
  <template v-for="(entry, index) in list(props.items)" :key="keyOf(entry, index)">
    <SelectItem v-if="typeof entry === 'string'" :value="entry">
      <SelectItemText>{{ entry }}</SelectItemText>
      <SelectItemIndicator />
    </SelectItem>
    <SelectSeparator v-else-if="entry.type === 'separator'" />
    <SelectGroup v-else-if="entry.type === 'group'">
      <SelectGroupLabel v-if="entry.label">{{ entry.label }}</SelectGroupLabel>
      <SelectItems :items="entry.items" />
    </SelectGroup>
    <SelectItem v-else :value="entry.value" :label="entry.label" :disabled="entry.disabled">
      <SelectItemText>{{ entry.label }}</SelectItemText>
      <SelectItemIndicator />
    </SelectItem>
  </template>
</template>
