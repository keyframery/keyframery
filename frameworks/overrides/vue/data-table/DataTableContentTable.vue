<script setup lang="ts">
/* The table itself (React's ContentTable): the select-all header, the column headers, then the rows, the loading
   rows or the empty state. Hidden columns fold away (useColumnPresence); rows are keyed by the epoch so a sort or
   a page turn cascades them in again. */
import { computed, type VNodeChild } from "vue"

import { Checkbox } from "@/components/keyframery/checkbox"
import { type DataTableColumn, textOf, valueOf } from "@/components/keyframery/core/data-table-core"
import { Button } from "@/components/keyframery/button"
import { Menu, MenuContent, MenuTrigger } from "@/components/keyframery/menu"
import { Skeleton } from "@/components/keyframery/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/keyframery/table"
import { cn } from "@/lib/utils"

import DataTableColumnHeader from "./DataTableColumnHeader.vue"
import DataTableEmpty from "./DataTableEmpty.vue"
import DataTableHead from "./DataTableHead.vue"
import DataTableRow from "./DataTableRow.vue"
import { Ellipsis } from "./icons"
import { columnClass, stickyCell } from "./layout"
import { dataTableBodyMotion, dataTableCellMotion, onElement, useColumnPresence, useDataTable } from "./parts"
import type { DataTableColumnDef } from "./types"

type ContentState = {
  loading: boolean
  empty: boolean
  entries: { id: string; row: any }[]
  columns: DataTableColumn[]
  allColumns: DataTableColumn[]
  sort: { id: string; direction: "ascending" | "descending" } | null
  selectable: boolean
  selected: string[]
  pageSelection: "all" | "some" | "none"
  pageSize: number
  epoch: number
  direction: "forward" | "backward" | "none"
  label: string
}

const props = defineProps<{ state: ContentState; rowActions?: (row: any) => VNodeChild; emptyTitle: string; emptyDescription?: string }>()
const api = useDataTable()
const presence = useColumnPresence(
  () => props.state.allColumns as DataTableColumnDef<any>[],
  () => props.state.columns as DataTableColumnDef<any>[],
)
const columns = computed(() => presence.columns())
const span = computed(() => columns.value.length + (props.state.selectable ? 1 : 0) + (props.rowActions ? 1 : 0))
const edge = "first:ps-4 last:pe-4"
/* Loading bars vary their width row to row, so they read as text, not a grid. */
const barWidths = ["72%", "54%", "64%", "46%", "68%", "58%"]
const loadingRows = computed(() => Array.from({ length: Math.min(props.state.pageSize, 12) }, (_, r) => r))
const sortOf = (column: DataTableColumnDef<any>) => (props.state.sort?.id === column.id ? props.state.sort.direction : "none")
const cellOf = (column: DataTableColumnDef<any>, row: unknown) => {
  const value = valueOf(column as DataTableColumn, row)
  return column.cell ? column.cell(row as never, value) : textOf(value)
}
/* Renders a VNodeChild returned by a column's cell or the row menu. */
const Render = (p: { node: VNodeChild }) => p.node as any
Render.props = ["node"]
const tableRef = (el: unknown) => {
  const node = el && (el as { $el?: Element }).$el
  presence.ref.value = (node instanceof HTMLElement ? node : el instanceof HTMLElement ? el : null) as HTMLElement | null
}
</script>

<template>
  <Table :ref="tableRef" :aria-label="props.state.label || undefined">
    <TableHeader>
      <TableRow>
        <TableHead v-if="props.state.selectable" :class="cn('w-10 ps-4', stickyCell, '@max-[40rem]/data-table:left-0')">
          <Checkbox
            aria-label="Select every row on this page"
            data-data-table-select-all=""
            :disabled="props.state.loading || !props.state.entries.length"
            :checked="props.state.pageSelection === 'all' ? true : props.state.pageSelection === 'some' ? 'indeterminate' : false"
            @checked-change="(_checked: unknown, details: { event?: Event }) => api.togglePage(details?.event)"
          />
        </TableHead>
        <DataTableHead
          v-for="{ column, leaving } in columns"
          :key="column.id"
          :value="column.id"
          :data-leaving="leaving ? '' : undefined"
          :data-sticky-edge="column.sticky ? '' : undefined"
          :aria-hidden="leaving ? 'true' : undefined"
          :class="cn(dataTableCellMotion, edge, columnClass(column, props.state.selectable))"
        >
          <template #render="{ props: head }">
            <TableHead v-bind="head">
              <div data-data-table-cell="" :class="cn('flex items-center', column.align === 'end' && 'justify-end', column.align === 'center' && 'justify-center')">
                <DataTableColumnHeader
                  :id="column.id"
                  :label="column.header"
                  :sort="sortOf(column)"
                  :sortable="column.sortable ?? true"
                  :hideable="column.hideable ?? true"
                  :align="column.align"
                />
              </div>
            </TableHead>
          </template>
        </DataTableHead>
        <TableHead v-if="props.rowActions" class="w-12 pe-3">
          <span class="sr-only">Actions</span>
        </TableHead>
      </TableRow>
    </TableHeader>
    <TableBody :class="dataTableBodyMotion">
      <template v-if="props.state.loading">
        <TableRow v-for="r in loadingRows" :key="`loading-${r}`" class="hover:bg-transparent" aria-hidden="true">
          <TableCell v-if="props.state.selectable" class="ps-4">
            <Skeleton class="size-4 rounded-[5px]" />
          </TableCell>
          <TableCell v-for="({ column }, c) in columns" :key="column.id" :class="cn(edge, columnClass(column, props.state.selectable))">
            <Skeleton :class="cn('h-3', column.align === 'end' && 'ms-auto')" :style="{ width: barWidths[(r + c * 2) % barWidths.length] }" />
          </TableCell>
          <TableCell v-if="props.rowActions" />
        </TableRow>
      </template>
      <TableRow v-else-if="props.state.empty" class="hover:bg-transparent">
        <TableCell :colspan="span" class="h-auto p-0 whitespace-normal">
          <DataTableEmpty :title="props.emptyTitle" :description="props.emptyDescription" />
        </TableCell>
      </TableRow>
      <template v-else>
        <DataTableRow v-for="entry in props.state.entries" :key="`${props.state.epoch}:${entry.id}`" :value="entry.id">
          <template #render="{ props: row }">
            <TableRow v-bind="row">
              <TableCell v-if="props.state.selectable" :class="cn('w-10 ps-4', stickyCell, '@max-[40rem]/data-table:left-0')">
                <Checkbox
                  :aria-label="`Select ${api.rowLabel(entry.id)}`"
                  :data-data-table-select="entry.id"
                  :checked="props.state.selected.includes(entry.id)"
                  @checked-change="(_checked: unknown, details: { event?: Event }) => api.toggleRow(entry.id, details?.event)"
                />
              </TableCell>
              <TableCell
                v-for="{ column, leaving } in columns"
                :key="column.id"
                :data-leaving="leaving ? '' : undefined"
                :data-sticky-edge="column.sticky ? '' : undefined"
                :aria-hidden="leaving ? 'true' : undefined"
                :class="cn(dataTableCellMotion, edge, columnClass(column, props.state.selectable))"
              >
                <div data-data-table-cell=""><Render :node="cellOf(column, entry.row)" /></div>
              </TableCell>
              <TableCell v-if="props.rowActions" class="w-12 pe-3 text-end">
                <Menu>
                  <MenuTrigger
                    :data-data-table-row-menu="entry.id"
                    :aria-label="`Actions for ${api.rowLabel(entry.id)}`"
                    class="ms-auto bg-none text-muted-foreground shadow-none dark:bg-none hover:text-foreground data-open:bg-accent data-open:text-foreground dark:shadow-none"
                  >
                    <template #render="{ props: trigger }">
                      <Button variant="ghost" size="icon-sm" v-bind="onElement(trigger)"><Ellipsis /></Button>
                    </template>
                  </MenuTrigger>
                  <MenuContent align="end" class="w-44">
                    <Render :node="props.rowActions(entry.row)" />
                  </MenuContent>
                </Menu>
              </TableCell>
            </TableRow>
          </template>
        </DataTableRow>
      </template>
    </TableBody>
  </Table>
</template>
