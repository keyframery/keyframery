<script setup lang="ts">
import { Menu, MenuContent, MenuItem, MenuTrigger } from "@/components/keyframery/menu"
</script>

<template>
  <Menu>
    <MenuTrigger>Options</MenuTrigger>
    <MenuContent>
      <MenuItem value="edit">Edit</MenuItem>
      <MenuItem value="delete">Delete</MenuItem>
    </MenuContent>
  </Menu>
</template>
