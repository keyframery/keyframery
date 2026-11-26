<script setup lang="ts">
// Basic
// Right-click the area, or long-press it on a touch screen. The menu opens at the pointer.

import { Copy, Pencil, Trash2 } from "@lucide/vue"

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuItemIcon,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/keyframery/context-menu"
</script>

<template>
  <ContextMenu>
    <ContextMenuTrigger class="grid h-[160px] w-full max-w-[340px] place-items-center rounded-[14px] border border-dashed text-[13px] text-muted-foreground">Right-click here</ContextMenuTrigger>
    <ContextMenuContent class="w-48">
      <ContextMenuItem value="rename">
        <ContextMenuItemIcon>
          <Pencil />
        </ContextMenuItemIcon>
        Rename
      </ContextMenuItem>
      <ContextMenuItem value="duplicate" shortcut="mod+d">
        <ContextMenuItemIcon>
          <Copy />
        </ContextMenuItemIcon>
        Duplicate
        <ContextMenuShortcut />
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem value="delete" destructive>
        <ContextMenuItemIcon>
          <Trash2 />
        </ContextMenuItemIcon>
        Delete
      </ContextMenuItem>
    </ContextMenuContent>
  </ContextMenu>
</template>
