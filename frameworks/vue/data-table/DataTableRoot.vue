<script lang="ts">
/* The list screen's root (src/components/primitives/data-table.tsx DataTableRoot): makes the instance from
   the options, renders the root part and shares the handle with the controls inside (useDataTable).
   Every option is a prop; each `on<Name>Change` callback is also emitted as `update:<name>`, so
   `v-model:sort`, `v-model:selected`, `v-model:page`… work. */
import { type PropType, defineComponent, provide } from "vue"
import type { ChangeDetails } from "@ui-sdk/core"
import { type PartSlots, usePart, usePrimitive } from "@ui-sdk/vue/primitive"

import {
  type DataTableColumn,
  type DataTableFilters,
  type DataTableOptions,
  type DataTableSort,
  dataTable,
} from "@/components/keyframery/core/data-table-core"
import { cn } from "@/lib/utils"

import { dataTableHandleKey } from "./parts"

type Callback<T> = PropType<(value: T, details: ChangeDetails<any>) => void>
const keys = ["sort", "search", "filters", "hiddenColumns", "selected", "page", "pageSize"] as const

export default defineComponent({
  name: "DataTableRoot",
  inheritAttrs: false,
  props: {
    data: { type: Array as PropType<DataTableOptions["data"]>, default: undefined },
    columns: { type: Array as PropType<DataTableColumn[]>, default: undefined },
    getRowId: { type: Function as PropType<DataTableOptions["getRowId"]>, default: undefined },
    label: { type: String, default: undefined },
    loading: { type: Boolean, default: undefined },
    selectable: { type: Boolean, default: undefined },
    pageSizes: { type: Array as PropType<number[]>, default: undefined },
    sort: { type: Object as PropType<DataTableSort>, default: undefined },
    defaultSort: { type: Object as PropType<DataTableSort>, default: undefined },
    onSortChange: { type: Function as Callback<DataTableSort>, default: undefined },
    search: { type: String, default: undefined },
    defaultSearch: { type: String, default: undefined },
    onSearchChange: { type: Function as Callback<string>, default: undefined },
    filters: { type: Object as PropType<DataTableFilters>, default: undefined },
    defaultFilters: { type: Object as PropType<DataTableFilters>, default: undefined },
    onFiltersChange: { type: Function as Callback<DataTableFilters>, default: undefined },
    hiddenColumns: { type: Array as PropType<string[]>, default: undefined },
    defaultHiddenColumns: { type: Array as PropType<string[]>, default: undefined },
    onHiddenColumnsChange: { type: Function as Callback<string[]>, default: undefined },
    selected: { type: Array as PropType<string[]>, default: undefined },
    defaultSelected: { type: Array as PropType<string[]>, default: undefined },
    onSelectedChange: { type: Function as Callback<string[]>, default: undefined },
    page: { type: Number, default: undefined },
    defaultPage: { type: Number, default: undefined },
    onPageChange: { type: Function as Callback<number>, default: undefined },
    pageSize: { type: Number, default: undefined },
    defaultPageSize: { type: Number, default: undefined },
    onPageSizeChange: { type: Function as Callback<number>, default: undefined },
  },
  emits: {
    "update:sort": (_v: DataTableSort) => true,
    "update:search": (_v: string) => true,
    "update:filters": (_v: DataTableFilters) => true,
    "update:hiddenColumns": (_v: string[]) => true,
    "update:selected": (_v: string[]) => true,
    "update:page": (_v: number) => true,
    "update:pageSize": (_v: number) => true,
  },
  slots: Object as PartSlots<typeof dataTable, "root">,
  setup(props, { attrs, emit }) {
    const handle = usePrimitive(dataTable, () => {
      const options: Record<string, unknown> = {}
      for (const key of Object.keys(props) as (keyof typeof props)[]) options[key] = props[key]
      for (const key of keys) {
        const name = `on${key.charAt(0).toUpperCase()}${key.slice(1)}Change` as keyof typeof props
        const user = props[name] as ((value: unknown, details: ChangeDetails<any>) => void) | undefined
        options[name] = (value: unknown, details: ChangeDetails<any>) => {
          user?.(value, details)
          if (!details?.canceled) (emit as (event: string, value: unknown) => void)(`update:${key}`, value)
        }
      }
      return options as DataTableOptions
    })
    provide(dataTableHandleKey, handle)
    return usePart(handle, "root", undefined, () => ({ ...attrs, class: cn("@container/data-table relative flex min-w-0 flex-col", attrs.class as string) }), "div")
  },
})
</script>

<style>
/* Rows rise (or drop) in with a little blur; the bulk bar rises. Backwards fill, so a delayed row is hidden on its first frame. */
@keyframes kf-data-table-row { from { opacity: 0; translate: 0 var(--kf-dt-from, 8px); filter: blur(3px) } }
@keyframes kf-data-table-rise { from { opacity: 0; translate: 0 calc(8px + 6px * var(--kf-flourish, 1)); scale: calc(.96 - .02 * var(--kf-flourish, 1)); filter: blur(calc(6px * var(--kf-flourish, 1))) } }
</style>
