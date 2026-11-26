<script setup lang="ts">
/* Renders a menu written as data with the styled parts. */
import type { MenuData } from "@ui-sdk/vue/menu"
import MenuCheckboxItem from "./MenuCheckboxItem.vue"
import MenuGroup from "./MenuGroup.vue"
import MenuGroupLabel from "./MenuGroupLabel.vue"
import MenuItem from "./MenuItem.vue"
import MenuItemIndicator from "./MenuItemIndicator.vue"
import MenuItems from "./MenuItems.vue"
import MenuRadioGroup from "./MenuRadioGroup.vue"
import MenuRadioItem from "./MenuRadioItem.vue"
import MenuSeparator from "./MenuSeparator.vue"
import MenuSub from "./MenuSub.vue"
import MenuSubContent from "./MenuSubContent.vue"
import MenuSubTrigger from "./MenuSubTrigger.vue"

const props = defineProps<{ items: MenuData }>()
const norm = (entry: any): any => (typeof entry === "string" ? { value: entry, label: entry } : entry)
const kind = (item: any) => (!("type" in item) || item.type === undefined || item.type === "item" ? "item" : item.type)
const keyOf = (item: any, index: number) =>
  ({ item: item.value, separator: `separator-${index}`, group: `group-${index}`, checkbox: item.value, "radio-group": item.name, submenu: `submenu-${index}` })[kind(item) as string] ?? index
</script>

<template>
  <template v-for="(item, index) in props.items.map(norm)" :key="keyOf(item, index)">
    <MenuItem v-if="kind(item) === 'item'" :value="item.value" :disabled="item.disabled" :shortcut="item.shortcut" :close-on-select="item.closeOnSelect" :destructive="item.destructive">{{ item.label }}</MenuItem>
    <MenuSeparator v-else-if="kind(item) === 'separator'" />
    <MenuGroup v-else-if="kind(item) === 'group'">
      <MenuGroupLabel v-if="item.label">{{ item.label }}</MenuGroupLabel>
      <MenuItems :items="item.items" />
    </MenuGroup>
    <MenuCheckboxItem v-else-if="kind(item) === 'checkbox'" :value="item.value" :disabled="item.disabled" :checked="item.checked" :default-checked="item.defaultChecked" :close-on-select="item.closeOnSelect">{{ item.label }}<MenuItemIndicator /></MenuCheckboxItem>
    <MenuRadioGroup v-else-if="kind(item) === 'radio-group'" :name="item.name" :value="item.value" :default-value="item.defaultValue">
      <MenuGroupLabel v-if="item.label">{{ item.label }}</MenuGroupLabel>
      <MenuRadioItem v-for="radio in item.items" :key="radio.value" :value="radio.value" :disabled="radio.disabled">{{ radio.label }}<MenuItemIndicator /></MenuRadioItem>
    </MenuRadioGroup>
    <MenuSub v-else-if="kind(item) === 'submenu'">
      <MenuSubTrigger :disabled="item.disabled">{{ item.label }}</MenuSubTrigger>
      <MenuSubContent><MenuItems :items="item.items" /></MenuSubContent>
    </MenuSub>
  </template>
</template>
