<script setup lang="ts">
/* Hover and selection fade. `selected` sets `aria-selected` and `data-selected` for the styles. */
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"
import { rowClass, TableRowPart } from "./parts"

defineOptions({ inheritAttrs: false })
withDefaults(defineProps<{ selected?: boolean }>(), { selected: undefined })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
</script>

<template>
  <TableRowPart v-bind="forwarded" :selected="selected" :class="cn(rowClass, attrs.class as any)">
    <template #default="scope"><slot v-bind="scope" /></template>
  </TableRowPart>
</template>
