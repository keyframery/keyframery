<script setup lang="ts">
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"
import { cellClass, TableCellPart } from "./parts"

defineOptions({ inheritAttrs: false })
/* React's `colSpan` / `rowSpan` names work too (`:col-span="3"`); they render as `colspan` / `rowspan`. */
const props = defineProps<{ colSpan?: number | string; rowSpan?: number | string }>()
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return { ...rest, ...(props.colSpan !== undefined ? { colspan: props.colSpan } : {}), ...(props.rowSpan !== undefined ? { rowspan: props.rowSpan } : {}) }
})
</script>

<template>
  <TableCellPart v-bind="forwarded" :class="cn(cellClass, attrs.class as any)">
    <template #default="scope"><slot v-bind="scope" /></template>
  </TableCellPart>
</template>
