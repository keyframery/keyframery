<script setup lang="ts">
// A menu as data
// Pass `items` and the menu renders itself: items, groups, separators, checkboxes and submenus. Place a `MenuContent` of your own only when you want to change it.

import { Menu, type MenuData, MenuTrigger } from "@/components/keyframery/menu"

const items: MenuData = [
  { value: "rename", label: "Rename" },
  { value: "duplicate", label: "Duplicate", shortcut: "mod+d" },
  { type: "separator" },
  {
    type: "submenu",
    label: "Move to",
    items: ["Drafts", "Published", "Archive"],
  },
  { type: "separator" },
  { value: "delete", label: "Delete", destructive: true },
]
</script>

<template>
  <Menu :items="items">
    <MenuTrigger>Actions</MenuTrigger>
  </Menu>
</template>
