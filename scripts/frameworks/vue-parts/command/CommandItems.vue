<script setup lang="ts">
/* @@BANNER
   Renders the commands passed as data with the styled parts, like React's CommandItems. */
import type { CommandData } from "@ui-sdk/vue/command"
import CommandGroup from "./CommandGroup.vue"
import CommandGroupLabel from "./CommandGroupLabel.vue"
import CommandItem from "./CommandItem.vue"
import CommandItemText from "./CommandItemText.vue"
import CommandSeparator from "./CommandSeparator.vue"
import CommandShortcut from "./CommandShortcut.vue"

defineOptions({ name: "CommandItems" })
const props = defineProps<{ items: CommandData }>()
const list = (items: CommandData | undefined) => (items ?? []) as any[]
const command = (entry: any) => (typeof entry === "string" ? { value: entry, label: entry } : entry)
const keyOf = (entry: any, index: number) =>
  typeof entry !== "string" && "type" in entry ? (entry.type === "separator" ? `separator-${index}` : `group-${entry.label ?? index}`) : command(entry).value
</script>

<template>
  <template v-for="(entry, index) in list(props.items)" :key="keyOf(entry, index)">
    <CommandSeparator v-if="typeof entry !== 'string' && 'type' in entry && entry.type === 'separator'" />
    <CommandGroup v-else-if="typeof entry !== 'string' && 'type' in entry">
      <CommandGroupLabel v-if="entry.label">{{ entry.label }}</CommandGroupLabel>
      <CommandItems :items="entry.items" />
    </CommandGroup>
    <CommandItem v-else :value="command(entry).value" :label="command(entry).label" :keywords="command(entry).keywords" :disabled="command(entry).disabled" :shortcut="command(entry).shortcut">
      <CommandItemText>{{ command(entry).label }}</CommandItemText>
      <CommandShortcut v-if="command(entry).shortcut" />
    </CommandItem>
  </template>
</template>
