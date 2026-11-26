<script setup lang="ts">
import { TreeGroup, TreeItem, TreeItemCheckbox, TreeItemIndicator, TreeItemLabel } from "@kf/tree"
import Albums from "./Albums.vue"

export type Album = { value: string; label: string; count: number; children?: Album[] }
defineProps<{ albums: Album[]; checkable: boolean }>()
</script>

<template>
  <TreeItem v-for="album in albums" :key="album.value" :value="album.value" :data-value="album.value">
    <TreeItemLabel>
      <TreeItemIndicator v-if="album.children" />
      <TreeItemCheckbox v-if="checkable" />
      <svg v-if="album.children" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="text-muted-foreground">
        <path d="M2.5 5.25c0-.97.78-1.75 1.75-1.75h1.9c.46 0 .9.18 1.24.51l.7.7c.14.14.33.22.53.22h3.13c.97 0 1.75.78 1.75 1.75v4.07c0 .97-.78 1.75-1.75 1.75h-7.5c-.97 0-1.75-.78-1.75-1.75V5.25Z" />
      </svg>
      <svg v-else viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="text-muted-foreground">
        <rect x="2.5" y="3" width="11" height="10" rx="2.25" />
        <path d="m2.75 10.75 2.55-2.55a1 1 0 0 1 1.4 0l3.05 3.05M9 10.5l.8-.8a1 1 0 0 1 1.4 0l2.05 2.05" />
        <path d="M10.25 6.25h.01" />
      </svg>
      <span class="truncate">{{ album.label }}</span>
      <span class="ml-auto pl-3 text-[12px] font-normal text-muted-foreground tabular-nums">{{ album.count }}</span>
    </TreeItemLabel>
    <TreeGroup v-if="album.children">
      <Albums :albums="album.children" :checkable="checkable" />
    </TreeGroup>
  </TreeItem>
</template>
