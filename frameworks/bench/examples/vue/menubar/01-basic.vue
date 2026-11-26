<script setup lang="ts">
// An app's menu bar
// Once one menu is open, moving the pointer or the arrow keys along the bar opens the next.

import { Menu, Menubar, MenuCheckboxItem, MenuContent, MenuItem, MenuItemIndicator, MenuSeparator, MenuTrigger } from "@/components/keyframery/menubar"
</script>

<template>
  <Menubar aria-label="Editor">
    <Menu>
      <MenuTrigger>File</MenuTrigger>
      <MenuContent class="w-52">
        <MenuItem value="new" shortcut="mod+n">New</MenuItem>
        <MenuItem value="open" shortcut="mod+o">Open…</MenuItem>
        <MenuSeparator />
        <MenuItem value="print" shortcut="mod+p">Print</MenuItem>
      </MenuContent>
    </Menu>
    <Menu>
      <MenuTrigger>Edit</MenuTrigger>
      <MenuContent class="w-52">
        <MenuItem value="undo" shortcut="mod+z">Undo</MenuItem>
        <MenuItem value="redo" shortcut="mod+shift+z">Redo</MenuItem>
      </MenuContent>
    </Menu>
    <Menu>
      <MenuTrigger>View</MenuTrigger>
      <MenuContent class="w-52">
        <MenuCheckboxItem value="wrap" default-checked>Word wrap<MenuItemIndicator /></MenuCheckboxItem>
        <MenuCheckboxItem value="lines">Line numbers<MenuItemIndicator /></MenuCheckboxItem>
      </MenuContent>
    </Menu>
  </Menubar>
</template>
