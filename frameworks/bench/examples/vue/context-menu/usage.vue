<script setup lang="ts">
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@/components/keyframery/context-menu"
</script>

<template>
  <ContextMenu>
    <ContextMenuTrigger>Right-click here</ContextMenuTrigger>
    <ContextMenuContent>
      <ContextMenuItem value="copy">Copy</ContextMenuItem>
      <ContextMenuItem value="paste">Paste</ContextMenuItem>
    </ContextMenuContent>
  </ContextMenu>
</template>
