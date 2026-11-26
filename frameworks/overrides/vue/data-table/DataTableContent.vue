<script setup lang="ts">
/* The table in its card: headers, rows (or the loading rows, or the empty state). Row menu items come from
   `rowActions` or the `#row-actions="{ row }"` slot. */
import { useSlots, type VNodeChild } from "vue"

import { cn } from "@/lib/utils"

import DataTableContentTable from "./DataTableContentTable.vue"
import { parts } from "./parts"

const props = withDefaults(
  defineProps<{ rowActions?: (row: any) => VNodeChild; emptyTitle?: string; emptyDescription?: string; class?: string }>(),
  { rowActions: undefined, emptyTitle: "No results", emptyDescription: undefined, class: undefined },
)
const slots = useSlots() as { "row-actions"?: (scope: { row: any }) => VNodeChild }
const actions = () => {
  const slot = slots["row-actions"]
  return slot ? (row: any) => slot({ row }) : props.rowActions
}
const base = cn(
  "overflow-hidden rounded-[var(--data-table-radius,14px)] bg-[var(--data-table-surface,var(--card))]",
  "shadow-[0_0_0_1px_var(--data-table-border,rgb(0_0_0/0.07)),0_1px_2px_rgb(0_0_0/0.04)] dark:shadow-[0_0_0_1px_var(--data-table-border,rgb(255_255_255/0.08))]",
  "[--table-height:var(--data-table-row-height,2.75rem)] [--table-accent:var(--data-table-accent,var(--foreground))]",
  /* On a narrow container the first columns stay put, so the scroll edge needs no fade. */
  "@max-[40rem]/data-table:[&_[data-slot=table-container]]:[mask-image:none]",
)
</script>

<template>
  <parts.Content :class="cn(base, props.class)">
    <template #default="{ state }">
      <DataTableContentTable :state="state" :row-actions="actions()" :empty-title="props.emptyTitle ?? 'No results'" :empty-description="props.emptyDescription" />
    </template>
  </parts.Content>
</template>
