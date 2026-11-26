"use client"

/* Animated data table, on UI SDK's core. UI SDK ships no data table, so its state (sort, search,
   filters, hidden columns, selection, page and page size) and its row model are defined in
   `@/components/core/data-table` with `definePrimitive`, and rendered here as parts. Each part hands
   its children the state they show, so you compose the controls inside with any UI SDK components
   (the styled `@/components/ui/data-table` does it with Keyframery's). This file adds motion only.
   Colours, radii, shadows and spacing stay yours.

   - Cascade: after a sort or a page turn every row of the page arrives again, one after another,
     from the side the page was reached from (below for Next, above for Previous). After a search
     or a filter, only the rows that are new to the page arrive. Selecting does not replay anything.
   - Collapse: a hidden column folds to nothing while the others close the gap; a column shown
     again opens out of nothing.
   - Rise: the bulk bar rises from the bottom centre while rows are selected, and sinks away.
   - Slide: Reset slides in beside the filters while anything is filtered, and out again.

   Parts: DataTableRoot, DataTableToolbar, DataTableSearch, DataTableFilters, DataTableReset,
   DataTableView, DataTableContent, DataTableHead, DataTableRow, DataTableEmpty, DataTableFooter,
   DataTableBulkBar; helpers: useDataTable (the api), useColumnPresence, dataTableBodyMotion,
   dataTableCellMotion. */

import type { SlotName, StateOf } from "@ui-sdk/core"
import { type PartProps, type PrimitiveHandle, usePart, usePrimitive } from "@ui-sdk/react/primitive"
import * as React from "react"

import { type DataTableColumn, type DataTableOptions, dataTable } from "@/components/core/data-table"
import { cn } from "@/lib/utils"

type Part<Slot extends SlotName<typeof dataTable>, Tag extends keyof React.JSX.IntrinsicElements = "div"> = PartProps<Tag, StateOf<typeof dataTable, Slot>>

/* UI SDK parts take a class name or a function of the part's state. Keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

/* ---------------------------------------------------------------- motion */

/* Rows rise (or drop) in with a little blur. The delay per row comes from the table's own
   stylesheet (`--kf-row`, set by nth-child on the table body), so the two tables cascade alike.
   The cascade scales with --kf-flourish: at 0 the new rows are simply there. */
const keyframes =
  "@keyframes kf-data-table-row{from{opacity:0;translate:0 var(--kf-dt-from,8px);filter:blur(3px)}}" +
  "@keyframes kf-data-table-rise{from{opacity:0;translate:0 calc(8px + 6px * var(--kf-flourish,1));scale:calc(.96 - .02 * var(--kf-flourish,1));filter:blur(calc(6px * var(--kf-flourish,1)))}}"

/** For the table body: the cascade, with the direction from the content part's `data-direction`. */
const dataTableBodyMotion = cn(
  "[&>tr]:animate-[kf-data-table-row_calc(420ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-spring)_backwards]",
  "[&>tr]:[animation-delay:calc(var(--kf-row,0)*30ms*var(--kf-speed,1)*var(--kf-flourish,1))]",
  "[[data-direction=backward]_&]:[--kf-dt-from:-8px]",
  "motion-reduce:[&>tr]:animate-none",
)

/** For every header and cell: a column that leaves folds to nothing; one that arrives opens out.
    Put the cell's content in an element with `data-data-table-cell` (the styled table does). */
const dataTableCellMotion = cn(
  "transition-[padding] duration-[calc(320ms*var(--kf-speed,1))] ease-house motion-reduce:transition-none",
  "data-leaving:px-0! data-leaving:duration-[calc(240ms*var(--kf-speed,1))]",
  "[&>[data-data-table-cell]]:[interpolate-size:allow-keywords] [&>[data-data-table-cell]]:w-auto [&>[data-data-table-cell]]:overflow-hidden",
  "[&>[data-data-table-cell]]:transition-[width,opacity,filter] [&>[data-data-table-cell]]:duration-[calc(360ms*var(--kf-speed,1))] [&>[data-data-table-cell]]:ease-house",
  "[&>[data-data-table-cell]]:starting:w-0 [&>[data-data-table-cell]]:starting:opacity-0 [&>[data-data-table-cell]]:starting:blur-[calc(4px*var(--kf-flourish,1))]",
  "data-leaving:[&>[data-data-table-cell]]:w-0 data-leaving:[&>[data-data-table-cell]]:opacity-0 data-leaving:[&>[data-data-table-cell]]:blur-[calc(4px*var(--kf-flourish,1))] data-leaving:[&>[data-data-table-cell]]:duration-[calc(240ms*var(--kf-speed,1))]",
  "motion-reduce:[&>[data-data-table-cell]]:transition-none",
)

/* Each column that was just hidden stays for this long, folding, before it leaves the page. */
const LEAVE_MS = 260

/** The columns to draw: the visible ones, plus any that were just hidden and are still folding
    away (with `leaving`). Columns keep their definition order. */
function useColumnPresence<C extends { id: string }>(all: readonly C[], visible: readonly C[]) {
  const ids = visible.map((c) => c.id).join("\u0000")
  const [seen, setSeen] = React.useState(ids)
  const [leaving, setLeaving] = React.useState<string[]>([])
  const ref = React.useRef<HTMLElement | null>(null)
  /* Worked out during render, so a hidden column never leaves the page for a frame before it folds. */
  if (seen !== ids) {
    const now = ids ? ids.split("\u0000") : []
    const gone = (seen ? seen.split("\u0000") : []).filter((id) => !now.includes(id))
    setSeen(ids)
    setLeaving((current) => [...new Set([...current.filter((id) => !now.includes(id)), ...gone])])
  }
  React.useEffect(() => {
    if (!leaving.length) return
    const el = ref.current
    const speed = (el && parseFloat(getComputedStyle(el).getPropertyValue("--kf-speed"))) || 1
    const reduce = typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches
    const done = leaving
    const timer = setTimeout(() => setLeaving((current) => current.filter((id) => !done.includes(id))), reduce ? 0 : LEAVE_MS * speed)
    return () => clearTimeout(timer)
  }, [leaving])
  const shown = all.filter((c) => visible.some((v) => v.id === c.id) || leaving.includes(c.id))
  return { columns: shown.map((column) => ({ column, leaving: leaving.includes(column.id) })), ref }
}

/* ---------------------------------------------------------------- parts */

/* The instance, for controls composed inside that call its api. */
const DataTableHandle = React.createContext<PrimitiveHandle<typeof dataTable> | null>(null)

type DataTableRootProps = DataTableOptions & Omit<Part<"root">, keyof DataTableOptions>

/** The list screen. Pass `data`, `columns` and a `label`; compose the parts inside. */
function DataTableRoot({
  data,
  columns,
  getRowId,
  label,
  loading,
  selectable,
  pageSizes,
  sort,
  defaultSort,
  onSortChange,
  search,
  defaultSearch,
  onSearchChange,
  filters,
  defaultFilters,
  onFiltersChange,
  hiddenColumns,
  defaultHiddenColumns,
  onHiddenColumnsChange,
  selected,
  defaultSelected,
  onSelectedChange,
  page,
  defaultPage,
  onPageChange,
  pageSize,
  defaultPageSize,
  onPageSizeChange,
  className,
  children,
  ...props
}: DataTableRootProps) {
  const handle = usePrimitive(dataTable, {
    data,
    columns,
    getRowId,
    label,
    loading,
    selectable,
    pageSizes,
    sort,
    defaultSort,
    onSortChange,
    search,
    defaultSearch,
    onSearchChange,
    filters,
    defaultFilters,
    onFiltersChange,
    hiddenColumns,
    defaultHiddenColumns,
    onHiddenColumnsChange,
    selected,
    defaultSelected,
    onSelectedChange,
    page,
    defaultPage,
    onPageChange,
    pageSize,
    defaultPageSize,
    onPageSizeChange,
  })
  const root = usePart(
    handle,
    "root",
    {},
    { ...props, className: withClass("@container/data-table relative flex min-w-0 flex-col", className), children },
    "div",
  )
  return (
    <>
      <style href="kf-data-table" precedence="default">
        {keyframes}
      </style>
      <DataTableHandle value={handle}>{root}</DataTableHandle>
    </>
  )
}

/** The api, for a control you compose inside: `useDataTable().setSearch("…")`. */
function useDataTable() {
  const handle = React.use(DataTableHandle)
  if (!handle) throw new Error("useDataTable must be used inside a DataTable")
  return handle.api
}

function slotPart<S extends Exclude<SlotName<typeof dataTable>, "root" | "head" | "row">>(slot: S, base = "") {
  return function DataTablePart({ className, ...props }: Part<S>) {
    return usePart(dataTable, slot, {} as never, { ...props, className: withClass(base, className) } as never, "div")
  }
}

/** The row above the table. */
const DataTableToolbar = slotPart("toolbar")
/** Holds the search field: its children get `{ value, label, disabled }`. */
const DataTableSearch = slotPart("search")
/** Holds the filter chips: its children get `{ items }`, each with its options and their counts. */
const DataTableFilters = slotPart("filters")
/** Holds the content of the table: its children get the page's rows, the visible columns, the sort and the selection. */
const DataTableContent = slotPart("content")
/** Holds "View": its children get `{ columns }` with whether each shows. */
const DataTableView = slotPart("view")
/** Shown in place of the rows when nothing matches: its children get `{ filtered, search }`. */
const DataTableEmpty = slotPart("empty")
/** Under the table: its children get the page, the page count, the sizes and the selection count. */
const DataTableFooter = slotPart("footer")

/** Holds Reset. It slides in from the start while anything is filtered and takes no room otherwise. */
function DataTableReset({ className, children, ...props }: Part<"reset">) {
  return usePart(
    dataTable,
    "reset",
    {},
    {
      ...props,
      className: withClass(
        cn(
          "grid grid-cols-[0fr] opacity-0 -translate-x-2 blur-[calc(3px*var(--kf-flourish,1))] data-shown:grid-cols-[1fr] data-shown:translate-x-0 data-shown:opacity-100 data-shown:blur-none",
          "transition-[grid-template-columns,opacity,translate,filter] duration-[calc(200ms*var(--kf-speed,1))] ease-house",
          "data-shown:duration-[calc(380ms*var(--kf-speed,1))] data-shown:ease-spring",
          "[&>*]:min-w-0 [&>*]:overflow-hidden data-shown:[&>*]:overflow-visible",
          "motion-reduce:transition-none",
        ),
        className,
      ),
      children: (state) => (
        /* While hidden it can't be reached. */
        <div inert={!state.shown}>{typeof children === "function" ? children(state) : children}</div>
      ),
    },
    "div",
  )
}

/** One column's header. Pass `render` to draw it as your table's header cell. */
function DataTableHead({ value, className, ...props }: { value: string } & Omit<Part<"head", "th">, "value">) {
  return usePart(dataTable, "head", { value }, { ...props, className } as Part<"head", "th">, "th")
}

/** One row. Pass `render` to draw it as your table's row. */
function DataTableRow({ value, className, ...props }: { value: string } & Omit<Part<"row", "tr">, "value">) {
  return usePart(dataTable, "row", { value }, { ...props, className } as Part<"row", "tr">, "tr")
}

/** The bar that rises from the bottom centre while rows are selected. Place it after the content:
    it opens a room of its own there (`--data-table-bar-room`, its height) and floats at the bottom
    of the view while the content is taller than the screen. */
function DataTableBulkBar({ className, children, ...props }: Part<"bulk-bar">) {
  return usePart(
    dataTable,
    "bulk-bar",
    {},
    {
      ...props,
      className: withClass(
        cn(
          /* Height: while rows are selected the bar has a room of its own between the content and
             what follows, opened once on the first selection and closed when it clears, so it never
             covers a row. While the content runs past the screen it floats at the bottom of the view.
             Its rise is feedback (fade, 8px, 0.96); the extra travel and the blur scale with --kf-flourish. */
          "pointer-events-none sticky bottom-4 z-20 flex justify-center",
          "-mt-3 h-0 data-open:mt-0 data-open:h-[var(--data-table-bar-room,2.5rem)]",
          "transition-[height,margin-top] duration-[calc(240ms*var(--kf-speed,1))] ease-house data-open:duration-[calc(380ms*var(--kf-speed,1))]",
          "[&>*]:pointer-events-auto [&>*]:absolute [&>*]:bottom-0 [&>*]:origin-bottom",
          "[&>*]:transition-[opacity,translate,scale,filter]",
          "data-open:[&>*]:animate-[kf-data-table-rise_calc(460ms*var(--kf-speed,1))_var(--ease-spring)_backwards]",
          "data-closed:[&>*]:pointer-events-none data-closed:[&>*]:translate-y-[calc(8px+4px*var(--kf-flourish,1))] data-closed:[&>*]:scale-[0.96] data-closed:[&>*]:opacity-0 data-closed:[&>*]:blur-[calc(4px*var(--kf-flourish,1))]",
          "data-closed:[&>*]:duration-[calc(160ms*var(--kf-speed,1))] data-closed:[&>*]:ease-house",
          "motion-reduce:transition-none motion-reduce:[&>*]:animate-none motion-reduce:[&>*]:transition-none",
        ),
        className,
      ),
      children: (state) => <div inert={!state.open}>{typeof children === "function" ? children(state) : children}</div>,
    },
    "div",
  )
}

export {
  type DataTableColumn,
  dataTableBodyMotion,
  dataTableCellMotion,
  DataTableBulkBar,
  DataTableContent,
  DataTableEmpty,
  DataTableFilters,
  DataTableFooter,
  DataTableHead,
  DataTableReset,
  DataTableRoot,
  DataTableRow,
  DataTableSearch,
  DataTableToolbar,
  DataTableView,
  useColumnPresence,
  useDataTable,
}
export {
  dataTable,
  type DataTableFilters as DataTableFilterValues,
  type DataTableOptions,
  type DataTableSort,
  type DataTableSortDirection,
  facetCounts,
  filterRows,
  paginateRows,
  rowModel,
  searchRows,
  sortRows,
} from "@/components/core/data-table"





