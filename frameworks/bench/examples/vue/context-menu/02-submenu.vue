<script setup lang="ts">
// Submenu and checkable items
// `ContextMenuSub` nests a menu. Checkbox and radio items stay open when chosen, so several can be set in one go.

import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuGroupLabel,
  ContextMenuItem,
  ContextMenuItemIndicator,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/keyframery/context-menu"
</script>

<template>
  <ContextMenu>
    <ContextMenuTrigger class="grid h-[160px] w-full max-w-[340px] place-items-center rounded-[14px] border border-dashed text-[13px] text-muted-foreground">Right-click the document</ContextMenuTrigger>
    <ContextMenuContent class="w-52">
      <ContextMenuCheckboxItem value="ruler" default-checked>
        Show ruler<ContextMenuItemIndicator />
      </ContextMenuCheckboxItem>
      <ContextMenuCheckboxItem value="grid">Show grid<ContextMenuItemIndicator /></ContextMenuCheckboxItem>
      <ContextMenuSeparator />
      <ContextMenuGroup>
        <ContextMenuGroupLabel>Zoom</ContextMenuGroupLabel>
        <ContextMenuRadioGroup default-value="100">
          <ContextMenuRadioItem v-for="zoom in ['50', '100', '200']" :key="zoom" :value="zoom">
            {{ zoom }}%<ContextMenuItemIndicator />
          </ContextMenuRadioItem>
        </ContextMenuRadioGroup>
      </ContextMenuGroup>
      <ContextMenuSeparator />
      <ContextMenuSub>
        <ContextMenuSubTrigger>Export as</ContextMenuSubTrigger>
        <ContextMenuSubContent>
          <ContextMenuItem value="pdf">PDF</ContextMenuItem>
          <ContextMenuItem value="png">PNG</ContextMenuItem>
          <ContextMenuItem value="svg">SVG</ContextMenuItem>
        </ContextMenuSubContent>
      </ContextMenuSub>
    </ContextMenuContent>
  </ContextMenu>
</template>
