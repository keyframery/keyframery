<script setup lang="ts">
// Icons and shortcuts
// `shortcut` shows the keys on the item and also runs it from the keyboard while the menu is open. `onAction` hears every choice.

import { ref } from "vue"
import { Copy, Pencil, Share, Trash2 } from "@lucide/vue"

import { Menu, MenuContent, MenuItem, MenuItemIcon, MenuSeparator, MenuShortcut, MenuTrigger } from "@/components/keyframery/menu"

const last = ref<string | null>(null)
</script>

<template>
  <div class="flex flex-col items-center gap-3">
    <Menu @action="(value) => last = String(value)">
      <MenuTrigger>Actions</MenuTrigger>
      <MenuContent class="w-52">
        <MenuItem value="edit" shortcut="mod+e">
          <MenuItemIcon>
            <Pencil />
          </MenuItemIcon>
          Edit
          <MenuShortcut />
        </MenuItem>
        <MenuItem value="duplicate" shortcut="mod+d">
          <MenuItemIcon>
            <Copy />
          </MenuItemIcon>
          Duplicate
          <MenuShortcut />
        </MenuItem>
        <MenuItem value="share">
          <MenuItemIcon>
            <Share />
          </MenuItemIcon>
          Share…
        </MenuItem>
        <MenuSeparator />
        <MenuItem value="delete" destructive>
          <MenuItemIcon>
            <Trash2 />
          </MenuItemIcon>
          Delete
        </MenuItem>
      </MenuContent>
    </Menu>
    <span class="text-[12px] text-muted-foreground">{{ last ? `Chose “${last}”` : 'Nothing chosen yet' }}</span>
  </div>
</template>
