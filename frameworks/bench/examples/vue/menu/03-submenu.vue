<script setup lang="ts">
// Submenu
// `MenuSub` opens beside its item on hover, or with the right arrow key.

import { Menu, MenuContent, MenuItem, MenuSub, MenuSubContent, MenuSubTrigger, MenuTrigger } from "@/components/keyframery/menu"
</script>

<template>
  <Menu>
    <MenuTrigger>File</MenuTrigger>
    <MenuContent class="w-48">
      <MenuItem value="new">New</MenuItem>
      <MenuItem value="open">Open…</MenuItem>
      <MenuSub>
        <MenuSubTrigger>Export as</MenuSubTrigger>
        <MenuSubContent class="w-40">
          <MenuItem value="pdf">PDF</MenuItem>
          <MenuItem value="png">PNG</MenuItem>
          <MenuItem value="csv">CSV</MenuItem>
        </MenuSubContent>
      </MenuSub>
    </MenuContent>
  </Menu>
</template>
