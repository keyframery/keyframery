<script setup lang="ts">
/* Rises from the bottom centre while rows are selected: clear (or Escape), "N selected", then your actions
   (`actions(selected)` or the default slot `#default="{ selected }"`). Place it right after DataTableContent:
   it opens a room of its own there while rows are selected. Inert while closed. */
import { useSlots, type VNodeChild } from "vue"

import { Roll } from "@/components/keyframery/badge"
import { Toolbar, ToolbarButton, ToolbarSeparator } from "@/components/keyframery/toolbar"
import { cn } from "@/lib/utils"

import { X } from "./icons"
import { bulkBarMotion, parts, useDataTable } from "./parts"

const props = withDefaults(defineProps<{ class?: string; actions?: (selected: string[]) => VNodeChild }>(), { class: undefined, actions: undefined })
const slots = useSlots() as { default?: (scope: { selected: string[] }) => VNodeChild }
const api = useDataTable()
/* While it sinks away the count keeps its last number instead of rolling to 0. */
let last = { count: 0, selected: [] as string[] }
const keep = (state: { count: number; selected: string[] }) => {
  if (state.count) last = { count: state.count, selected: state.selected }
  return last
}
const content = (selected: string[]): VNodeChild => (slots.default ? slots.default({ selected }) : props.actions?.(selected))
const hasActions = () => !!(slots.default || props.actions)
const Render = (p: { node: VNodeChild }) => p.node as any
Render.props = ["node"]
</script>

<template>
  <parts.BulkBar :class="cn(bulkBarMotion, props.class)">
    <template #default="{ state }">
      <div :inert="!state.open">
        <Toolbar aria-label="Selected rows" data-data-table-bulk="" class="gap-1 rounded-[14px] bg-[var(--data-table-bar,var(--popover))] p-1.5 whitespace-nowrap">
          <ToolbarButton aria-label="Clear selection (Escape)" data-data-table-bulk-clear="" @click="(event: MouseEvent) => api.clearSelection(event)">
            <X />
          </ToolbarButton>
          <span class="px-1.5 text-[13px] font-medium text-foreground tabular-nums" aria-live="off"><Roll :text="String(keep(state).count)" /> selected</span>
          <ToolbarSeparator v-if="hasActions()" />
          <Render v-if="hasActions()" :node="content(keep(state).selected)" />
        </Toolbar>
      </div>
    </template>
  </parts.BulkBar>
</template>
