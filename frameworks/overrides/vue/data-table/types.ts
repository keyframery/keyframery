import type { VNodeChild } from "vue"

import type { DataTableColumn } from "@/components/keyframery/core/data-table-core"

/** A column, with a Vue cell renderer: `cell: (row, value) => h(Badge, () => value)`. Filter option icons are VNodes. */
export type DataTableColumnDef<Row = never> = DataTableColumn<Row, (row: Row, value: unknown) => VNodeChild, VNodeChild> & {
  /** Classes for this column's header and cells. */
  class?: string
}
