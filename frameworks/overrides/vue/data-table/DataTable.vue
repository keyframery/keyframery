<script setup lang="ts" generic="Row">
/* Styled data table (src/components/ui/data-table.tsx): the animated primitive composed with Keyframery's own
   components. A toolbar (search, filter chips with counts, Reset, View), the table in a card whose headers sort
   and hide from a small menu, rows with checkboxes and a row menu, an empty state and loading rows at the
   table's own geometry, a footer with "Rows per page", "Page X of Y" and the pages, and a bulk bar that rises
   while rows are selected.

   With no default slot it renders all of it; pass a default slot to compose the parts yourself.
   Row menu: `#row-actions="{ row }"` (MenuItems) or the `rowActions` prop. Bulk bar: `#bulk-actions="{ selected }"`
   (DataTableBulkActions) or `bulkActions`. More toolbar controls before View: `#toolbar`.

   Theming: --data-table-surface, --data-table-border, --data-table-accent, --data-table-radius,
   --data-table-row-height, --data-table-bar (each falls back to the theme's own token). */
import { computed, useAttrs, type VNodeChild } from "vue"

import type { DataTableColumn, DataTableOptions } from "@/components/keyframery/core/data-table-core"
import { Speed, type Speed as SpeedValue } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

import DataTableBulkBar from "./DataTableBulkBar.vue"
import DataTableContent from "./DataTableContent.vue"
import DataTableFooter from "./DataTableFooter.vue"
import DataTableRoot from "./DataTableRoot.vue"
import DataTableToolbar from "./DataTableToolbar.vue"
import type { DataTableColumnDef } from "./types"

defineOptions({ inheritAttrs: false })
const props = withDefaults(
  defineProps<{
    data: readonly Row[]
    columns: DataTableColumnDef<Row>[]
    getRowId?: (row: Row, index: number) => string
    speed?: SpeedValue
    /** The search field's placeholder. Defaults to "Search…". */
    searchPlaceholder?: string
    /** The row menu's items (MenuItems), or use the `#row-actions` slot. Leave both out for no row menu. */
    rowActions?: (row: Row) => VNodeChild
    /** The bulk bar's actions (DataTableBulkActions) for the selected row ids, or use the `#bulk-actions` slot. */
    bulkActions?: (selected: string[]) => VNodeChild
    /** What the empty state says. */
    emptyTitle?: string
    emptyDescription?: string
    /* Pass-through options (also accepted as attrs), declared for types and v-model. */
    label?: string
    loading?: boolean
    selectable?: boolean
    pageSizes?: number[]
    sort?: DataTableOptions["sort"]
    defaultSort?: DataTableOptions["defaultSort"]
    search?: string
    defaultSearch?: string
    filters?: DataTableOptions["filters"]
    defaultFilters?: DataTableOptions["defaultFilters"]
    hiddenColumns?: string[]
    defaultHiddenColumns?: string[]
    selected?: string[]
    defaultSelected?: string[]
    page?: number
    defaultPage?: number
    pageSize?: number
    defaultPageSize?: number
  }>(),
  {
    getRowId: undefined,
    speed: undefined,
    searchPlaceholder: undefined,
    rowActions: undefined,
    bulkActions: undefined,
    emptyTitle: undefined,
    emptyDescription: undefined,
    label: undefined,
    loading: undefined,
    selectable: undefined,
    pageSizes: undefined,
    sort: undefined,
    defaultSort: undefined,
    search: undefined,
    defaultSearch: undefined,
    filters: undefined,
    defaultFilters: undefined,
    hiddenColumns: undefined,
    defaultHiddenColumns: undefined,
    selected: undefined,
    defaultSelected: undefined,
    page: undefined,
    defaultPage: undefined,
    pageSize: undefined,
    defaultPageSize: undefined,
  },
)
const slots = defineSlots<{
  default?: () => any
  toolbar?: () => any
  "row-actions"?: (scope: { row: Row }) => any
  "bulk-actions"?: (scope: { selected: string[] }) => any
}>()
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const options = computed(() => {
  const { speed: _speed, searchPlaceholder: _p, rowActions: _r, bulkActions: _b, emptyTitle: _t, emptyDescription: _d, ...rest } = props
  return Object.fromEntries(Object.entries(rest).filter(([, v]) => v !== undefined))
})
const rowActions = computed(() => {
  const slot = slots["row-actions"]
  if (slot) return (row: unknown) => slot({ row: row as Row })
  return props.rowActions as ((row: unknown) => VNodeChild) | undefined
})
const bulkActions = computed(() => {
  const slot = slots["bulk-actions"]
  if (slot) return (selected: string[]) => slot({ selected })
  return props.bulkActions
})
</script>

<template>
  <Speed :speed="props.speed">
    <DataTableRoot
      v-bind="{ ...options, ...forwarded }"
      :data="props.data as unknown[]"
      :columns="props.columns as DataTableColumn[]"
      :get-row-id="props.getRowId as DataTableOptions['getRowId']"
      :class="cn('gap-3 text-[13px] text-foreground', typeof attrs.class === 'string' ? attrs.class : undefined)"
    >
      <slot v-if="slots.default" />
      <template v-else>
        <DataTableToolbar :search-placeholder="props.searchPlaceholder"><slot name="toolbar" /></DataTableToolbar>
        <DataTableContent :row-actions="rowActions" :empty-title="props.emptyTitle" :empty-description="props.emptyDescription" />
        <DataTableBulkBar :actions="bulkActions" />
        <DataTableFooter />
      </template>
    </DataTableRoot>
  </Speed>
</template>
