<script setup lang="ts">
/* A group's pages. In a collapsible group they sit in the collapsible's panel. */
import { computed, inject, useAttrs } from "vue"
import { CollapsiblePanel } from "@ui-sdk/vue/collapsible"

import { collapsiblePanelClass, groupKey, parts } from "./parts"

defineOptions({ inheritAttrs: false })
const collapsible = inject(groupKey, () => false)
const attrs = useAttrs()
const forwarded = computed(() => attrs)
</script>

<template>
  <CollapsiblePanel v-if="collapsible()" :class="collapsiblePanelClass">
    <parts.GroupContent v-bind="forwarded">
      <template #default="scope"><slot v-bind="scope" /></template>
    </parts.GroupContent>
  </CollapsiblePanel>
  <parts.GroupContent v-else v-bind="forwarded">
    <template #default="scope"><slot v-bind="scope" /></template>
  </parts.GroupContent>
</template>
