<script setup lang="ts">
// Checkbox and radio items
// They stay open when chosen, so several settings can change in one visit.

import {
  Menu,
  MenuCheckboxItem,
  MenuContent,
  MenuGroup,
  MenuGroupLabel,
  MenuItemIndicator,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuTrigger,
} from "@/components/keyframery/menu"
</script>

<template>
  <Menu>
    <MenuTrigger>View</MenuTrigger>
    <MenuContent class="w-52">
      <MenuCheckboxItem value="sidebar" default-checked>Show sidebar<MenuItemIndicator /></MenuCheckboxItem>
      <MenuCheckboxItem value="minimap">Show minimap<MenuItemIndicator /></MenuCheckboxItem>
      <MenuSeparator />
      <MenuGroup>
        <MenuGroupLabel>Sort by</MenuGroupLabel>
        <MenuRadioGroup default-value="name">
          <MenuRadioItem value="name">Name<MenuItemIndicator /></MenuRadioItem>
          <MenuRadioItem value="date">Date modified<MenuItemIndicator /></MenuRadioItem>
          <MenuRadioItem value="size">Size<MenuItemIndicator /></MenuRadioItem>
        </MenuRadioGroup>
      </MenuGroup>
    </MenuContent>
  </Menu>
</template>
