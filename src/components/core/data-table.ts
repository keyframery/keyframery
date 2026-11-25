/* A data table, as a UI SDK primitive. UI SDK ships no data table, so it is defined with its core:
   the same definition renders in React, Vue, Svelte, Solid and web components.

   `table` is the presentational table (headers, rows, a sort arrow). `dataTable` is the list screen
   built on it: it takes `data` and `columns` and owns the state a list screen needs: the sort, a
   search over chosen columns, a faceted filter per column, which columns are hidden, which rows are
   selected, the page and the page size. Every piece works uncontrolled (`defaultSort`) and
   controlled (`sort` with `onSortChange`), so a page can keep it in the URL.

   No table library: the row model at the bottom of this file (search, filter, sort, paginate and
   the facet counts) is plain functions with no DOM, exported for anyone who needs the same rows on
   the server. They stay fast at 500 rows and more: one pass to filter, one sort, one slice.

   Screen readers hear "N results" a moment after the search or a filter changes, and "N rows
   selected" when the selection does. Escape inside the table clears the selection. */

import { announce, type ChangeDetails, createChange, definePrimitive, elements } from "@ui-sdk/core"

/* ---------------------------------------------------------------- types */

/** A row of your data. Any object. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- rows are the caller's own type
type DataTableRow = any

type DataTableSortDirection = "ascending" | "descending"

/** The sorted column and its direction, or `null` for the data's own order. */
type DataTableSort = { id: string; direction: DataTableSortDirection } | null

/** The values chosen in each column's filter, by column id. A column with no values is unfiltered. */
type DataTableFilters = Record<string, string[]>

/** One value a column can be filtered by. `icon` is whatever your framework renders, like a React component. */
type DataTableFilterOption<Icon = unknown> = { value: string; label?: string; icon?: Icon }

/** One column. Everything but `id` and `header` is optional. */
type DataTableColumn<Row = DataTableRow, Cell = unknown, Icon = unknown> = {
  /** Names the column in state, in `filters`, in `hiddenColumns` and for agents. */
  id: string
  /** The column's label: the header, the "Toggle columns" menu, the filter chip, the agent. */
  header: string
  /** How to read the value: a key of the row, or a function. Defaults to `row[id]`. */
  accessor?: keyof Row | ((row: Row) => unknown)
  /** Renders the cell. Your framework's renderer, like a React function of the row. Defaults to the value as text. */
  cell?: Cell
  /** Offers Asc and Desc in the header's menu. Defaults to true. */
  sortable?: boolean
  /** The value to sort by, when it isn't the cell's value (a status in its own order, a date as a number). */
  sortValue?: (row: Row) => number | string
  /** Offers Hide in the header's menu and a row in "Toggle columns". Defaults to true. */
  hideable?: boolean
  /** The search field looks in this column. */
  searchable?: boolean
  /** Gives the column a faceted filter in the toolbar, with these values. */
  filter?: { title?: string; options: DataTableFilterOption<Icon>[] }
  /** Where the header and cells sit. Numbers usually go at the end. Defaults to "start". */
  align?: "start" | "center" | "end"
  /** Stays in view while the table scrolls sideways on a narrow container (the first column, usually). */
  sticky?: boolean
  /** Leaves the column out below this container width: "sm" 30rem, "md" 40rem, "lg" 52rem. */
  hideBelow?: "sm" | "md" | "lg"
}

/** One row of the current page, with its id. */
type DataTableEntry<Row = DataTableRow> = { id: string; row: Row }

/** How many rows would match each value of a column's filter, given everything else. */
type DataTableFacets = Record<string, Record<string, number>>

type DataTableModel<Row = DataTableRow> = {
  /** The rows of the current page. */
  entries: DataTableEntry<Row>[]
  /** How many rows match the search and filters, on every page. */
  total: number
  pageCount: number
  facets: DataTableFacets
}

type SortReason = "item-press" | "agent" | "none"
type SearchReason = "input-change" | "clear-press" | "agent" | "none"
type FiltersReason = "item-press" | "clear-press" | "agent" | "none"
type ColumnsReason = "item-press" | "agent" | "none"
type SelectedReason = "item-press" | "select-all" | "clear-press" | "escape-key" | "agent" | "none"
type PageReason = "item-press" | "filter-change" | "page-size-change" | "data-change" | "agent" | "none"

type DataTableOptions = {
  /** The rows. */
  data?: DataTableRow[]
  /** The columns, in order. */
  columns?: DataTableColumn[]
  /** Each row's id, for selection and for keys. Defaults to `row.id`, then the row's index. */
  getRowId?: (row: DataTableRow, index: number) => string
  /** The table's name, for screen readers and agents, like "Orders". */
  label?: string
  /** Shows skeleton rows at the table's own geometry while the data loads. */
  loading?: boolean
  /** Adds a checkbox to every row and a select-all to the header. Defaults to true. */
  selectable?: boolean
  /** The choices under "Rows per page". Defaults to 10, 20, 30, 40 and 50. */
  pageSizes?: number[]

  sort?: DataTableSort
  defaultSort?: DataTableSort
  onSortChange?: (sort: DataTableSort, details: ChangeDetails<SortReason>) => void
  /** The text in the search field. */
  search?: string
  defaultSearch?: string
  onSearchChange?: (search: string, details: ChangeDetails<SearchReason>) => void
  filters?: DataTableFilters
  defaultFilters?: DataTableFilters
  onFiltersChange?: (filters: DataTableFilters, details: ChangeDetails<FiltersReason>) => void
  /** The ids of the columns that are hidden. */
  hiddenColumns?: string[]
  defaultHiddenColumns?: string[]
  onHiddenColumnsChange?: (hidden: string[], details: ChangeDetails<ColumnsReason>) => void
  /** The ids of the selected rows, on every page. */
  selected?: string[]
  defaultSelected?: string[]
  onSelectedChange?: (selected: string[], details: ChangeDetails<SelectedReason>) => void
  /** The page, from 1. */
  page?: number
  defaultPage?: number
  onPageChange?: (page: number, details: ChangeDetails<PageReason>) => void
  pageSize?: number
  defaultPageSize?: number
  onPageSizeChange?: (pageSize: number, details: ChangeDetails<PageReason>) => void
}

/** What an agent and the column parts read about a column. */
type DataTableColumnInfo = {
  id: string
  label: string
  visible: boolean
  sortable: boolean
  hideable: boolean
  filterable: boolean
}

type Inputs = {
  data: DataTableRow[]
  defs: DataTableColumn[]
  getRowId: (row: DataTableRow, index: number) => string
  label: string
  loading: boolean
  selectable: boolean
  pageSizes: number[]
}

type DataTableState = Inputs & {
  sort: DataTableSort
  search: string
  filters: DataTableFilters
  hiddenColumns: string[]
  selected: string[]
  page: number
  pageSize: number
  model: DataTableModel
  /** Readable for agents: every column, with whether it shows. */
  columns: DataTableColumnInfo[]
  /** Readable for agents: the ids of the rows on this page, in order. */
  rows: string[]
  /** Readable for agents: how many rows match, on every page. */
  total: number
  pageCount: number
  /** Turns over when the rows are re-ordered (a sort, a page turn), so they cascade in again. */
  epoch: number
  /** Which way the last page turn went, so the new rows arrive from that side. */
  direction: "forward" | "backward" | "none"
}

/* ---------------------------------------------------------------- the row model */

const emptyRows: DataTableRow[] = []
const emptyColumns: DataTableColumn[] = []
const emptyList: string[] = []
const emptyFilters: DataTableFilters = {}
const defaultPageSizes = [10, 20, 30, 40, 50]
const defaultRowId = (row: DataTableRow, index: number) => {
  const id = row && typeof row === "object" ? (row as { id?: unknown }).id : undefined
  return id === undefined || id === null ? String(index) : String(id)
}

/** A column's value in a row. */
function valueOf(column: DataTableColumn, row: DataTableRow): unknown {
  const { accessor } = column
  if (typeof accessor === "function") return accessor(row)
  return row?.[(accessor ?? column.id) as string]
}

/** A value as the text a search and a filter compare. */
function textOf(value: unknown): string {
  if (value === null || value === undefined) return ""
  if (value instanceof Date) return value.toISOString()
  if (Array.isArray(value)) return value.map(textOf).join(" ")
  return String(value)
}

const collator = typeof Intl !== "undefined" ? new Intl.Collator(undefined, { numeric: true, sensitivity: "base" }) : null

/** Compares two values: numbers and dates by size, text in reading order, empty last. */
function compareValues(a: unknown, b: unknown): number {
  const emptyA = a === null || a === undefined || a === ""
  const emptyB = b === null || b === undefined || b === ""
  if (emptyA || emptyB) return emptyA === emptyB ? 0 : emptyA ? 1 : -1
  const na = a instanceof Date ? a.getTime() : a
  const nb = b instanceof Date ? b.getTime() : b
  if (typeof na === "number" && typeof nb === "number") return na - nb
  if (typeof na === "boolean" && typeof nb === "boolean") return Number(na) - Number(nb)
  const sa = textOf(na)
  const sb = textOf(nb)
  return collator ? collator.compare(sa, sb) : sa < sb ? -1 : sa > sb ? 1 : 0
}

/** Whether a row's value is one of the chosen values. A list value matches when any item does. */
function matchesFilter(value: unknown, chosen: string[]) {
  if (!chosen.length) return true
  if (Array.isArray(value)) return value.some((item) => chosen.includes(textOf(item)))
  return chosen.includes(textOf(value))
}

/** The rows whose searchable columns hold the search text, ignoring case. */
function searchRows<Row>(rows: Row[], columns: DataTableColumn<Row>[], search: string): Row[] {
  const needle = search.trim().toLowerCase()
  if (!needle) return rows
  const searchable = columns.filter((column) => column.searchable)
  if (!searchable.length) return rows
  return rows.filter((row) => searchable.some((column) => textOf(valueOf(column as DataTableColumn, row)).toLowerCase().includes(needle)))
}

/** The rows that pass every column filter, leaving out `skip` (for that column's own facet counts). */
function filterRows<Row>(rows: Row[], columns: DataTableColumn<Row>[], filters: DataTableFilters, skip?: string): Row[] {
  const active = columns.filter((column) => column.id !== skip && filters[column.id]?.length)
  if (!active.length) return rows
  return rows.filter((row) => active.every((column) => matchesFilter(valueOf(column as DataTableColumn, row), filters[column.id])))
}

/** The rows in the sort's order. Stable: rows that tie keep the order they had. */
function sameSort(a: DataTableSort, b: DataTableSort): boolean {
  return a === b || (!!a && !!b && a.id === b.id && a.direction === b.direction)
}

function sortRows<Row>(rows: Row[], columns: DataTableColumn<Row>[], sort: DataTableSort): Row[] {
  if (!sort) return rows
  const column = columns.find((c) => c.id === sort.id)
  if (!column) return rows
  const read = column.sortValue ?? ((row: Row) => valueOf(column as DataTableColumn, row))
  const sign = sort.direction === "descending" ? -1 : 1
  return rows
    .map((row, index) => ({ row, index, key: read(row) }))
    .sort((a, b) => {
      const compared = compareValues(a.key, b.key)
      /* Empty values stay last in either direction. */
      const emptyA = a.key === null || a.key === undefined || a.key === ""
      const emptyB = b.key === null || b.key === undefined || b.key === ""
      return (emptyA || emptyB ? compared : compared * sign) || a.index - b.index
    })
    .map((item) => item.row)
}

/** How many rows match each value of each filterable column, given the search and the other filters. */
function facetCounts<Row>(rows: Row[], columns: DataTableColumn<Row>[], filters: DataTableFilters): DataTableFacets {
  const facets: DataTableFacets = {}
  for (const column of columns) {
    if (!column.filter) continue
    const counts: Record<string, number> = {}
    for (const option of column.filter.options) counts[option.value] = 0
    for (const row of filterRows(rows, columns, filters, column.id)) {
      const value = valueOf(column as DataTableColumn, row)
      for (const item of Array.isArray(value) ? value : [value]) {
        const key = textOf(item)
        counts[key] = (counts[key] ?? 0) + 1
      }
    }
    facets[column.id] = counts
  }
  return facets
}

/** The number of pages for `total` rows, never less than one. */
function pageCountOf(total: number, pageSize: number) {
  return Math.max(1, Math.ceil(total / Math.max(1, pageSize)))
}

/** The rows of one page, from 1. */
function paginateRows<Row>(rows: Row[], page: number, pageSize: number): Row[] {
  const size = Math.max(1, pageSize)
  const at = (Math.min(Math.max(1, page), pageCountOf(rows.length, size)) - 1) * size
  return rows.slice(at, at + size)
}

/** Everything the table shows, from the data and the state: search, filter, facet, sort, page. */
function rowModel<Row>(input: {
  data: Row[]
  columns: DataTableColumn<Row>[]
  getRowId?: (row: Row, index: number) => string
  search?: string
  filters?: DataTableFilters
  sort?: DataTableSort
  page?: number
  pageSize?: number
}): DataTableModel<Row> {
  const getRowId = input.getRowId ?? defaultRowId
  const ids = new Map<Row, string>()
  input.data.forEach((row, index) => ids.set(row, getRowId(row, index)))
  const searched = searchRows(input.data, input.columns, input.search ?? "")
  const filters = input.filters ?? emptyFilters
  const filtered = filterRows(searched, input.columns, filters)
  const sorted = sortRows(filtered, input.columns, input.sort ?? null)
  const pageSize = input.pageSize ?? 10
  return {
    entries: paginateRows(sorted, input.page ?? 1, pageSize).map((row) => ({ id: ids.get(row) ?? "", row })),
    total: filtered.length,
    pageCount: pageCountOf(filtered.length, pageSize),
    facets: facetCounts(searched, input.columns, filters),
  }
}

/* ---------------------------------------------------------------- helpers */

const sameList = (a: readonly string[], b: readonly string[]) => a.length === b.length && a.every((item, i) => item === b[i])

const sameFilters = (a: DataTableFilters, b: DataTableFilters) => {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)])
  for (const key of keys) if (!sameList(a[key] ?? emptyList, b[key] ?? emptyList)) return false
  return true
}

/** Leaves out columns with no values, so `{}` means "no filters". */
function cleanFilters(filters: DataTableFilters): DataTableFilters {
  const next: DataTableFilters = {}
  for (const [key, values] of Object.entries(filters)) if (values?.length) next[key] = [...values]
  return next
}

const isFiltered = (state: Pick<DataTableState, "search" | "filters">) =>
  state.search.trim() !== "" || Object.values(state.filters).some((values) => values.length > 0)

function inputsOf(options: DataTableOptions): Inputs {
  return {
    data: options.data ?? emptyRows,
    defs: options.columns ?? emptyColumns,
    getRowId: options.getRowId ?? defaultRowId,
    label: options.label ?? "",
    loading: options.loading ?? false,
    selectable: options.selectable ?? true,
    pageSizes: options.pageSizes ?? defaultPageSizes,
  }
}

function columnInfo(defs: DataTableColumn[], hidden: string[]): DataTableColumnInfo[] {
  return defs.map((column) => ({
    id: column.id,
    label: column.header,
    visible: !hidden.includes(column.id),
    sortable: column.sortable ?? true,
    hideable: column.hideable ?? true,
    filterable: !!column.filter,
  }))
}

function derive(state: Omit<DataTableState, "model" | "columns" | "rows" | "total" | "pageCount">) {
  const model = rowModel({
    data: state.data,
    columns: state.defs,
    getRowId: state.getRowId,
    search: state.search,
    filters: state.filters,
    sort: state.sort,
    page: state.page,
    pageSize: state.pageSize,
  })
  return {
    model,
    columns: columnInfo(state.defs, state.hiddenColumns),
    rows: model.entries.map((entry) => entry.id),
    total: model.total,
    pageCount: model.pageCount,
  }
}

/** A short line of a row's values, for agents and the row's checkbox name. */
function rowText(defs: DataTableColumn[], row: DataTableRow) {
  return defs
    .map((column) => textOf(valueOf(column, row)))
    .filter(Boolean)
    .slice(0, 4)
    .join(", ")
}

/* ---------------------------------------------------------------- the primitive */

const dataTable = definePrimitive({
  name: "data-table",
  options: {
    data: "value",
    columns: "value",
    getRowId: "value",
    label: "string",
    loading: "boolean",
    selectable: "boolean",
    pageSizes: "list",
    sort: "value",
    defaultSort: "value",
    onSortChange: "callback",
    search: "string",
    defaultSearch: "string",
    onSearchChange: "callback",
    filters: "value",
    defaultFilters: "value",
    onFiltersChange: "callback",
    hiddenColumns: "list",
    defaultHiddenColumns: "list",
    onHiddenColumnsChange: "callback",
    selected: "list",
    defaultSelected: "list",
    onSelectedChange: "callback",
    page: "number",
    defaultPage: "number",
    onPageChange: "callback",
    pageSize: "number",
    defaultPageSize: "number",
    onPageSizeChange: "callback",
  },
  controlled: ["sort", "search", "filters", "hiddenColumns", "selected", "page", "pageSize", "columns", "rows", "total", "pageCount", "loading"],
  state: (options: DataTableOptions): DataTableState => {
    const base = {
      ...inputsOf(options),
      sort: options.sort !== undefined ? options.sort : (options.defaultSort ?? null),
      search: options.search ?? options.defaultSearch ?? "",
      filters: cleanFilters(options.filters ?? options.defaultFilters ?? emptyFilters),
      hiddenColumns: options.hiddenColumns ?? options.defaultHiddenColumns ?? emptyList,
      selected: options.selected ?? options.defaultSelected ?? emptyList,
      page: Math.max(1, options.page ?? options.defaultPage ?? 1),
      pageSize: Math.max(1, options.pageSize ?? options.defaultPageSize ?? 10),
      epoch: 0,
      direction: "none" as const,
    }
    return { ...base, ...derive(base) }
  },
  sync: (options) => ({
    ...inputsOf(options),
    ...(options.sort === undefined ? {} : { sort: options.sort }),
    ...(options.search === undefined ? {} : { search: options.search }),
    ...(options.filters === undefined ? {} : { filters: cleanFilters(options.filters) }),
    ...(options.hiddenColumns === undefined ? {} : { hiddenColumns: options.hiddenColumns }),
    ...(options.selected === undefined ? {} : { selected: options.selected }),
    ...(options.page === undefined ? {} : { page: Math.max(1, options.page) }),
    ...(options.pageSize === undefined ? {} : { pageSize: Math.max(1, options.pageSize) }),
  }),
  api: (context) => {
    const { store } = context
    const change = createChange(context)

    /* The model is derived from the data and the state, which a parent may control. Recompute it
       whenever one of them is a new value, and keep the page inside the page count. */
    const inputKeys = ["data", "defs", "getRowId", "search", "filters", "sort", "page", "pageSize", "hiddenColumns"] as const
    let from = store.get()
    context.onDestroy(
      store.subscribe(() => {
        const now = store.get()
        /* A parent that builds its `sort` inline passes an equal but new object on every render; only a
           different column or direction is a new order (otherwise each render replays the rows' entrance). */
        const sortChanged = !sameSort(now.sort, from.sort)
        if (!sortChanged && inputKeys.every((key) => key === "sort" || now[key] === from[key])) return
        const reordered = sortChanged || now.page !== from.page || now.pageSize !== from.pageSize
        const direction = now.page > from.page ? "forward" : now.page < from.page ? "backward" : sortChanged ? "none" : now.direction
        const derived = derive(now)
        from = { ...now, ...derived }
        store.set({ ...derived, ...(reordered ? { epoch: now.epoch + 1, direction } : {}) })
        from = store.get()
        /* Fewer rows than before can leave the page past the end. */
        if (now.page > derived.pageCount) change("page", derived.pageCount, { reason: "data-change" })
      }),
    )

    const pageTo = (page: number, reason: PageReason, event?: Event) => {
      const { pageCount } = store.get()
      const next = Math.min(Math.max(1, Math.round(page)), pageCount)
      if (next === store.get().page) return false
      return change("page", next, { reason, event })
    }
    const firstPage = (reason: PageReason) => {
      if (store.get().page !== 1) change("page", 1, { reason })
    }

    const setFilters = (filters: DataTableFilters, reason: FiltersReason, event?: Event) => {
      const next = cleanFilters(filters)
      if (sameFilters(next, store.get().filters)) return false
      const done = change("filters", next, { reason, event })
      firstPage("filter-change")
      return done
    }

    const setSelected = (ids: string[], reason: SelectedReason, event?: Event) => {
      const next = [...new Set(ids)]
      if (sameList(next, store.get().selected)) return false
      return change("selected", next, { reason, event })
    }

    const setHidden = (hidden: string[], reason: ColumnsReason, event?: Event) => {
      const { defs } = store.get()
      /* Only hideable columns hide, and one column always stays. */
      const next = defs.filter((c) => hidden.includes(c.id) && (c.hideable ?? true)).map((c) => c.id)
      if (defs.length && next.length >= defs.length) return false
      if (sameList(next, store.get().hiddenColumns)) return false
      return change("hiddenColumns", next, { reason, event })
    }

    /* The bulk bar closes and turns inert when the selection clears. If focus was in it, put it
       back in the table (the select-all, or the first control there) instead of losing it. */
    const keepFocus = (clear: () => boolean) => {
      const active = typeof document === "undefined" ? null : document.activeElement
      const bar = elements(context, "bulk-bar")[0]?.el
      const inBar = !!(active && bar && bar.contains(active))
      const done = clear()
      if (done && inBar) {
        const content = elements(context, "content")[0]?.el
        content?.querySelector<HTMLElement>('[role="checkbox"]:not([aria-disabled="true"]), button:not([disabled]), [tabindex="0"]')?.focus()
      }
      return done
    }

    const column = (id: string) => store.get().defs.find((c) => c.id === id || c.header.toLowerCase() === String(id).toLowerCase())

    return {
      /* ---- sort */
      /** Sorts by a column ("ascending" or "descending"), or clears the sort with "none". */
      setSort(columnId: string, direction: DataTableSortDirection | "none" = "ascending", event?: Event) {
        const target = column(columnId)
        if (direction === "none" || !target) {
          if (store.get().sort === null) return false
          return change("sort", null, { reason: event ? "item-press" : "agent", event })
        }
        if (!(target.sortable ?? true)) return false
        const now = store.get().sort
        if (now?.id === target.id && now.direction === direction) return false
        return change("sort", { id: target.id, direction }, { reason: event ? "item-press" : "agent", event })
      },
      /** Turns a column's sort over: unsorted or descending becomes ascending, ascending descending. */
      toggleSort(columnId: string, event?: Event) {
        const now = store.get().sort
        const target = column(columnId)
        if (!target) return false
        const direction: DataTableSortDirection = now?.id === target.id && now.direction === "ascending" ? "descending" : "ascending"
        return this.setSort(target.id, direction, event)
      },
      clearSort: () => (store.get().sort === null ? false : change("sort", null, { reason: "agent" })),

      /* ---- search */
      /** Searches the searchable columns. An empty string clears the search. */
      setSearch(text: string, event?: Event) {
        const next = String(text ?? "")
        if (next === store.get().search) return false
        const done = change("search", next, { reason: event ? "input-change" : "agent", event })
        firstPage("filter-change")
        return done
      },
      clearSearch: (event?: Event) => {
        if (!store.get().search) return false
        const done = change("search", "", { reason: event ? "clear-press" : "agent", event })
        firstPage("filter-change")
        return done
      },

      /* ---- filters */
      /** Keeps only rows whose column holds one of these values. An empty list clears that filter. */
      setFilter(columnId: string, values: string[], event?: Event) {
        const target = column(columnId)
        if (!target?.filter) return false
        /* Agents may pass labels: map them to values. */
        const options = target.filter.options
        const mapped = (Array.isArray(values) ? values : [values]).map((v) => options.find((o) => o.value === v || [o.value, o.label ?? ""].some((name) => name.toLowerCase() === String(v).toLowerCase()))?.value ?? String(v))
        return setFilters({ ...store.get().filters, [target.id]: mapped }, event ? "item-press" : "agent", event)
      },
      /** Adds a value to a column's filter, or takes it out. */
      toggleFilterValue(columnId: string, value: string, event?: Event) {
        const target = column(columnId)
        if (!target?.filter) return false
        const now = store.get().filters[target.id] ?? emptyList
        return this.setFilter(target.id, now.includes(value) ? now.filter((v) => v !== value) : [...now, value], event)
      },
      clearFilter(columnId: string, event?: Event) {
        const target = column(columnId)
        if (!target) return false
        return setFilters({ ...store.get().filters, [target.id]: [] }, event ? "clear-press" : "agent", event)
      },
      /** Clears the search and every filter: the toolbar's Reset. */
      resetFilters(event?: Event) {
        const reason = event ? "clear-press" : "agent"
        const searched = store.get().search ? change("search", "", { reason, event }) : false
        const filtered = setFilters({}, reason, event)
        firstPage("filter-change")
        return searched || filtered
      },

      /* ---- columns */
      hideColumn(columnId: string, event?: Event) {
        const target = column(columnId)
        if (!target) return false
        return setHidden([...store.get().hiddenColumns, target.id], event ? "item-press" : "agent", event)
      },
      showColumn(columnId: string, event?: Event) {
        const target = column(columnId)
        if (!target) return false
        return setHidden(store.get().hiddenColumns.filter((id) => id !== target.id), event ? "item-press" : "agent", event)
      },
      toggleColumn(columnId: string, event?: Event) {
        const target = column(columnId)
        if (!target) return false
        return store.get().hiddenColumns.includes(target.id) ? this.showColumn(target.id, event) : this.hideColumn(target.id, event)
      },

      /* ---- selection */
      /** Selects these rows (by id) and only these. */
      setSelected: (ids: string[], event?: Event) => setSelected(Array.isArray(ids) ? ids.map(String) : [String(ids)], event ? "item-press" : "agent", event),
      /** Adds rows (by id) to the selection. */
      selectRows: (ids: string[], event?: Event) =>
        setSelected([...store.get().selected, ...(Array.isArray(ids) ? ids.map(String) : [String(ids)])], event ? "item-press" : "agent", event),
      toggleRow(id: string, event?: Event) {
        const now = store.get().selected
        const key = String(id)
        return setSelected(now.includes(key) ? now.filter((x) => x !== key) : [...now, key], event ? "item-press" : "agent", event)
      },
      /** Selects every row on this page, or lets go of them when all are selected. */
      togglePage(event?: Event) {
        const { selected, rows } = store.get()
        const all = rows.length > 0 && rows.every((id) => selected.includes(id))
        return setSelected(all ? selected.filter((id) => !rows.includes(id)) : [...selected, ...rows], "select-all", event)
      },
      selectPage: () => setSelected([...store.get().selected, ...store.get().rows], "agent"),
      clearSelection: (event?: Event) => keepFocus(() => setSelected([], event?.type === "keydown" ? "escape-key" : event ? "clear-press" : "agent", event)),

      /* ---- pages */
      /** Goes to a page, from 1. */
      setPage: (page: number, event?: Event) => pageTo(Number(page), event ? "item-press" : "agent", event),
      nextPage: (event?: Event) => pageTo(store.get().page + 1, event ? "item-press" : "agent", event),
      previousPage: (event?: Event) => pageTo(store.get().page - 1, event ? "item-press" : "agent", event),
      /** Shows this many rows per page, and goes back to the first page. */
      setPageSize(size: number, event?: Event) {
        const next = Math.max(1, Math.round(Number(size)))
        if (!Number.isFinite(next) || next === store.get().pageSize) return false
        const done = change("pageSize", next, { reason: event ? "page-size-change" : "agent", event })
        firstPage("page-size-change")
        return done
      },

      /* ---- reading */
      /** The rows of this page, for agents: each row's id and a short line of its values. */
      visibleRows() {
        const { model, defs, hiddenColumns } = store.get()
        const shown = defs.filter((c) => !hiddenColumns.includes(c.id))
        return model.entries.map((entry) => ({ value: entry.id, label: rowText(shown, entry.row) }))
      },
      /** A short line of a row's values, to name its checkbox. */
      rowLabel(id: string) {
        const { model, defs } = store.get()
        const entry = model.entries.find((e) => e.id === id)
        return entry ? rowText(defs, entry.row) : id
      },

      /* ---- the element */
      /** Escape inside the table clears the selection, unless something inside used it first. */
      keydown(event: KeyboardEvent, el: HTMLElement) {
        if (event.key !== "Escape" || event.defaultPrevented) return
        if (!(event.target instanceof Node) || !el.contains(event.target)) return
        if (!store.get().selected.length) return
        event.preventDefault()
        keepFocus(() => setSelected([], "escape-key", event))
      },
      /** Tells screen readers how many rows match and how many are selected, as those change. */
      announcements(el: HTMLElement) {
        const doc = el.ownerDocument
        let last = store.get()
        let timer: ReturnType<typeof setTimeout> | undefined
        const stop = store.subscribe(() => {
          const now = store.get()
          if (now.selected !== last.selected && now.selected.length !== last.selected.length) {
            const n = now.selected.length
            announce(n ? `${n} ${n === 1 ? "row" : "rows"} selected` : "Selection cleared", { doc })
          }
          if (now.search !== last.search || now.filters !== last.filters) {
            clearTimeout(timer)
            /* After the person stops typing, once. */
            timer = setTimeout(() => {
              const total = store.get().total
              announce(`${total} ${total === 1 ? "result" : "results"}`, { doc })
            }, 600)
          }
          last = now
        })
        return () => {
          clearTimeout(timer)
          stop()
        }
      },
    }
  },
  slots: (slot) => {
    const pageSelection = (state: DataTableState): "all" | "some" | "none" => {
      const onPage = state.rows.filter((id) => state.selected.includes(id)).length
      return onPage === 0 ? "none" : onPage === state.rows.length ? "all" : "some"
    }
    const visibleDefs = (state: DataTableState) => state.defs.filter((c) => !state.hiddenColumns.includes(c.id))

    return {
      /* The whole list screen. Name it with `label` (or `aria-label`). */
      root: slot<{}, { loading: boolean; filtered: boolean; selectedCount: number; total: number }>({
        role: "group",
        state: (state) => ({ loading: state.loading, filtered: isFiltered(state), selectedCount: state.selected.length, total: state.total }),
        attrs: (state) => ({
          "aria-label": state.label || undefined,
          "data-loading": state.loading ? "" : undefined,
          "data-filtered": isFiltered(state) ? "" : undefined,
          "data-selecting": state.selected.length ? "" : undefined,
        }),
        on: {
          keydown: (event, { el, api }) => {
            if (el) api.keydown(event as KeyboardEvent, el)
          },
        },
        bind: (el, part) => part.api.announcements(el),
      }),

      /* The row above the table: search, filters, Reset, then View. */
      toolbar: slot<{}, { filtered: boolean }>({
        state: (state) => ({ filtered: isFiltered(state) }),
        attrs: (state) => ({ "data-filtered": isFiltered(state) ? "" : undefined }),
      }),

      /* Holds the search field. */
      search: slot<{}, { value: string; label: string; disabled: boolean }>({
        present: (state) => state.defs.some((c) => c.searchable),
        state: (state) => ({
          value: state.search,
          label: `Search by ${state.defs.filter((c) => c.searchable).map((c) => c.header.toLowerCase()).join(" and ")}`,
          disabled: state.loading,
        }),
      }),

      /* Holds a filter chip per filterable column, with the counts from the row model. */
      filters: slot<{}, { items: { id: string; title: string; selected: string[]; options: { value: string; label: string; count: number; icon?: unknown }[] }[] }>({
        state: (state) => ({
          items: state.defs
            .filter((c) => c.filter)
            .map((c) => ({
              id: c.id,
              title: c.filter?.title ?? c.header,
              selected: state.filters[c.id] ?? emptyList,
              options: (c.filter?.options ?? []).map((o) => ({ value: o.value, label: o.label ?? o.value, count: state.model.facets[c.id]?.[o.value] ?? 0, icon: o.icon })),
            })),
        }),
      }),

      /* Holds Reset, which shows only while the search or a filter is on. The renderer makes it inert while hidden. */
      reset: slot<{}, { shown: boolean }>({
        state: (state) => ({ shown: isFiltered(state) }),
        attrs: (state) => ({
          "data-shown": isFiltered(state) ? "" : undefined,
          "aria-hidden": isFiltered(state) ? undefined : "true",
        }),
      }),

      /* Holds View, the "Toggle columns" menu. */
      view: slot<{}, { columns: DataTableColumnInfo[] }>({
        state: (state) => ({ columns: state.columns.filter((c) => c.hideable) }),
      }),

      /* Holds the table: headers, rows, the empty state and the loading rows. */
      content: slot<
        {},
        {
          loading: boolean
          empty: boolean
          entries: DataTableEntry[]
          columns: DataTableColumn[]
          allColumns: DataTableColumn[]
          sort: DataTableSort
          selectable: boolean
          selected: string[]
          pageSelection: "all" | "some" | "none"
          pageSize: number
          epoch: number
          direction: "forward" | "backward" | "none"
          label: string
        }
      >({
        state: (state) => ({
          loading: state.loading,
          empty: !state.loading && state.total === 0,
          entries: state.model.entries,
          columns: visibleDefs(state),
          allColumns: state.defs,
          sort: state.sort,
          selectable: state.selectable,
          selected: state.selected,
          pageSelection: pageSelection(state),
          pageSize: state.pageSize,
          epoch: state.epoch,
          direction: state.direction,
          label: state.label,
        }),
        attrs: (state) => ({
          "aria-busy": state.loading ? "true" : undefined,
          "data-loading": state.loading ? "" : undefined,
          "data-direction": state.direction,
        }),
      }),

      /* One column's header: it reports its sort with `aria-sort`. Keyed by the column's id. */
      head: slot<{ value: string }, { sort: DataTableSortDirection | "none"; sortable: boolean; hideable: boolean; label: string }>({
        props: { value: "key" },
        state: (state, part) => {
          const c = state.defs.find((d) => d.id === part.key)
          return {
            sort: state.sort?.id === part.key ? state.sort.direction : "none",
            sortable: c?.sortable ?? true,
            hideable: c?.hideable ?? true,
            label: c?.header ?? part.key,
          }
        },
        attrs: (state, part) => {
          const c = state.defs.find((d) => d.id === part.key)
          const sortable = c?.sortable ?? true
          const sort = state.sort?.id === part.key ? state.sort.direction : "none"
          return {
            "aria-sort": sortable ? sort : undefined,
            "data-sorted": sortable ? sort : undefined,
            "data-column": part.key,
            "data-align": c?.align ?? "start",
          }
        },
      }),

      /* One row. Keyed by the row's id. */
      row: slot<{ value: string }, { selected: boolean }>({
        props: { value: "key" },
        state: (state, part) => ({ selected: state.selected.includes(part.key) }),
        attrs: (state, part) => ({
          "data-row": part.key,
          "data-selected": state.selected.includes(part.key) ? "" : undefined,
          "aria-selected": state.selectable ? String(state.selected.includes(part.key)) : undefined,
        }),
      }),

      /* Shown in place of the rows when nothing matches. */
      empty: slot<{}, { filtered: boolean; search: string }>({
        present: (state) => !state.loading && state.total === 0,
        state: (state) => ({ filtered: isFiltered(state), search: state.search }),
      }),

      /* Under the table: the selection count, "Rows per page", "Page X of Y" and the pages. */
      footer: slot<{}, { page: number; pageCount: number; pageSize: number; pageSizes: number[]; total: number; selectedCount: number; selectable: boolean }>({
        state: (state) => ({
          page: state.page,
          pageCount: state.pageCount,
          pageSize: state.pageSize,
          pageSizes: state.pageSizes.includes(state.pageSize) ? state.pageSizes : [...state.pageSizes, state.pageSize].sort((a, b) => a - b),
          total: state.total,
          selectedCount: state.selected.length,
          selectable: state.selectable,
        }),
      }),

      /* The bar that rises from the bottom centre while rows are selected. The renderer makes it inert while closed. */
      "bulk-bar": slot<{}, { open: boolean; count: number; selected: string[] }>({
        state: (state) => ({ open: state.selected.length > 0, count: state.selected.length, selected: state.selected }),
        attrs: (state) => ({
          "data-open": state.selected.length ? "" : undefined,
          "data-closed": state.selected.length ? undefined : "",
          "aria-hidden": state.selected.length ? undefined : "true",
        }),
      }),
    }
  },
  agent: {
    actions: [
      "setSort",
      "clearSort",
      "setSearch",
      "clearSearch",
      "setFilter",
      "clearFilter",
      "resetFilters",
      "hideColumn",
      "showColumn",
      "setPage",
      "nextPage",
      "previousPage",
      "setPageSize",
      "setSelected",
      "selectRows",
      "toggleRow",
      "selectPage",
      "clearSelection",
    ],
    items: (api) => api.visibleRows(),
  },
})

export {
  compareValues,
  type DataTableColumn,
  type DataTableColumnInfo,
  type DataTableEntry,
  type DataTableFacets,
  type DataTableFilterOption,
  type DataTableFilters,
  type DataTableModel,
  type DataTableOptions,
  type DataTableRow,
  type DataTableSort,
  type DataTableSortDirection,
  type DataTableState,
  dataTable,
  facetCounts,
  filterRows,
  pageCountOf,
  paginateRows,
  rowModel,
  searchRows,
  sortRows,
  textOf,
  valueOf,
}
