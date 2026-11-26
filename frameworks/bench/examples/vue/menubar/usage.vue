<script setup lang="ts">
import { Menu, Menubar, MenuContent, MenuItem, MenuTrigger } from "@/components/keyframery/menubar"
</script>

<template>
  <Menubar aria-label="App">
    <Menu>
      <MenuTrigger>File</MenuTrigger>
      <MenuContent>
        <MenuItem value="new">New</MenuItem>
      </MenuContent>
    </Menu>
  </Menubar>
</template>
