<script setup lang="ts">
/* One suggestion row per item: icon, label, detail; groups recurse. (React: MenuRows.) */
import type { TriggerMenuData } from "@ui-sdk/vue/trigger-menu"

import { TriggerMenuGroup, TriggerMenuGroupLabel, TriggerMenuItem, TriggerMenuItemIcon } from "@/components/keyframery/trigger-menu"
import type { PromptComposerItem } from "./types"

defineOptions({ name: "PromptComposerMenuRows" })
defineProps<{ items: TriggerMenuData<unknown> | undefined; lookup: (value: string) => PromptComposerItem | undefined }>()
const kind = (entry: unknown) =>
  typeof entry === "string" ? "skip" : (entry as { type?: string }).type === "separator" ? "skip" : (entry as { type?: string }).type === "group" ? "group" : "item"
const keyOf = (entry: any, index: number) => (kind(entry) === "group" ? `group-${entry.label ?? index}` : String(entry?.value ?? index))
</script>

<template>
  <template v-for="(entry, index) in items ?? []" :key="keyOf(entry, index)">
    <TriggerMenuGroup v-if="kind(entry) === 'group'">
      <TriggerMenuGroupLabel v-if="(entry as any).label">{{ (entry as any).label }}</TriggerMenuGroupLabel>
      <PromptComposerMenuRows :items="(entry as any).items" :lookup="lookup" />
    </TriggerMenuGroup>
    <TriggerMenuItem v-else-if="kind(entry) === 'item'" :value="(entry as any).value" :label="(entry as any).label" :keywords="(entry as any).keywords">
      <TriggerMenuItemIcon v-if="lookup(String((entry as any).value))?.icon"><component :is="lookup(String((entry as any).value))!.icon" /></TriggerMenuItemIcon>
      <span class="min-w-0 flex-1 truncate">{{ (entry as any).label }}</span>
      <span
        v-if="lookup(String((entry as any).value))?.description"
        class="shrink-0 text-[12px] text-muted-foreground tabular-nums group-data-highlighted/item:text-current/70"
        >{{ lookup(String((entry as any).value))!.description }}</span
      >
    </TriggerMenuItem>
  </template>
</template>
