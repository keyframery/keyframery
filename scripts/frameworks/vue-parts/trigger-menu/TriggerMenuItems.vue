<script setup lang="ts">
/* @@BANNER
   Renders items passed as data with the styled parts, like React's TriggerMenuItems. */
import type { TriggerMenuData } from "@ui-sdk/vue/trigger-menu"
import TriggerMenuGroup from "./TriggerMenuGroup.vue"
import TriggerMenuGroupLabel from "./TriggerMenuGroupLabel.vue"
import TriggerMenuItem from "./TriggerMenuItem.vue"
import TriggerMenuSeparator from "./TriggerMenuSeparator.vue"

defineOptions({ name: "TriggerMenuItems" })
const props = defineProps<{ items?: TriggerMenuData<any> }>()
const list = (items: TriggerMenuData<any> | undefined) => (items ?? []) as any[]
const keyOf = (entry: any, index: number) =>
  typeof entry === "string" ? entry : entry.type === "separator" ? `separator-${index}` : entry.type === "group" ? `group-${entry.label ?? index}` : typeof entry.value === "string" ? entry.value : index
</script>

<template>
  <template v-for="(entry, index) in list(props.items)" :key="keyOf(entry, index)">
    <TriggerMenuItem v-if="typeof entry === 'string'" :value="entry" :label="entry">{{ entry }}</TriggerMenuItem>
    <TriggerMenuSeparator v-else-if="entry.type === 'separator'" />
    <TriggerMenuGroup v-else-if="entry.type === 'group'">
      <TriggerMenuGroupLabel v-if="entry.label">{{ entry.label }}</TriggerMenuGroupLabel>
      <TriggerMenuItems :items="entry.items" />
    </TriggerMenuGroup>
    <TriggerMenuItem v-else :value="entry.value" :label="entry.label" :disabled="entry.disabled" :keywords="entry.keywords">{{ entry.label }}</TriggerMenuItem>
  </template>
</template>
