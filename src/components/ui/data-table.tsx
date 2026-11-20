"use client"

export * from "@/components/primitives/data-table"

/* Styled data table: the animated primitive composed with Keyframery's own components. A toolbar
   (search field, filter chips with counts, Reset, View), a table in a card whose headers sort and
   hide from a small menu, rows with checkboxes and a row menu, an empty state and loading rows at
   the table's own geometry, a footer with "Rows per page", "Page X of Y" and the pages, and a bulk
   bar that rises while rows are selected.

   `DataTable` with no children renders all of it. Pass children to compose the parts yourself
   (`DataTableToolbar`, `DataTableContent`, `DataTableFooter`, `DataTableBulkBar`, …).

   Theming: set these CSS variables on the table or anything around it. Each falls back to the
   theme's own token, so nothing changes until you set one.
     --data-table-surface     the table's card and its sticky cells   (default: --card)
     --data-table-border      the card's hairline                     (default: black 7%, white 8% in dark)
     --data-table-accent      the hover and selected row tint         (default: --foreground)
     --data-table-radius      the card's corners                      (default: 14px)
     --data-table-row-height  each row's height                       (default: 2.75rem)
     --data-table-bar         the bulk bar's surface                  (default: --popover) */

import { ArrowDown, ArrowUp, ChevronsUpDown, Ellipsis, EyeOff, Search, SearchX, Settings2, X } from "lucide-react"
import * as React from "react"

import { type DataTableColumn, type DataTableOptions, textOf, valueOf } from "@/components/core/data-table"
import {
  DataTableBulkBar as DataTableBulkBarPrimitive,
  dataTableBodyMotion,
  dataTableCellMotion,
  DataTableContent as DataTableContentPrimitive,
  DataTableEmpty as DataTableEmptyPrimitive,
  DataTableFilters as DataTableFiltersPrimitive,
  DataTableFooter as DataTableFooterPrimitive,
  DataTableHead as DataTableHeadPrimitive,
  DataTableReset as DataTableResetPrimitive,
  DataTableRoot,
  DataTableRow as DataTableRowPrimitive,
  DataTableSearch as DataTableSearchPrimitive,
  DataTableToolbar as DataTableToolbarPrimitive,
  DataTableView as DataTableViewPrimitive,
  useColumnPresence,
  useDataTable,
} from "@/components/primitives/data-table"
import { Roll } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Filter } from "@/components/ui/filter"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import {
  Menu,
  MenuCheckboxItem,
  MenuContent,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuItemIcon,
  MenuItemIndicator,
  MenuSeparator,
  MenuTrigger,
} from "@/components/ui/menu"
import { Pagination, PaginationFirst, PaginationItem, PaginationLast, PaginationLink, PaginationEllipsis, PaginationList, PaginationNext, PaginationPrevious, PaginationRoll } from "@/components/ui/pagination"
import { Select, SelectContent, SelectItem, SelectItemIndicator, SelectItemText, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Toolbar, ToolbarButton, ToolbarSeparator } from "@/components/ui/toolbar"
import { Speed, type SpeedProps } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

/* One size and one stroke for every icon in the data table. */
const icon = { size: 16, strokeWidth: 1.75, "aria-hidden": true } as const

/* ---------------------------------------------------------------- types */

/** A column, with a React cell renderer: `cell: (row, value) => <Badge>{value}</Badge>`. */
type DataTableColumnDef<Row = never> = DataTableColumn<Row, (row: Row, value: unknown) => React.ReactNode, React.ReactNode> & {
  /** Classes for this column's header and cells. */
  className?: string
}

type DataTableProps<Row> = Omit<DataTableOptions, "data" | "columns" | "getRowId"> &
  SpeedProps &
  Omit<React.ComponentProps<typeof DataTableRoot>, keyof DataTableOptions | "children"> & {
    data: readonly Row[]
    columns: DataTableColumnDef<Row>[]
    getRowId?: (row: Row, index: number) => string
    /** The search field's placeholder. Defaults to "Search…". */
    searchPlaceholder?: string
    /** The row menu's items (`MenuItem`s). Leave it out for no row menu. */
    rowActions?: (row: Row) => React.ReactNode
    /** The bulk bar's actions (`DataTableBulkAction`s), for the selected row ids. */
    bulkActions?: (selected: string[]) => React.ReactNode
    /** More controls at the end of the toolbar, before View. */
    toolbar?: React.ReactNode
    /** What the empty state says. */
    emptyTitle?: string
    emptyDescription?: string
    /** Your own composition of the parts. Leave it out for the whole screen. */
    children?: React.ReactNode
  }

/* ---------------------------------------------------------------- layout helpers */

const hideBelow = {
  sm: "@max-[30rem]/data-table:hidden",
  md: "@max-[40rem]/data-table:hidden",
  lg: "@max-[52rem]/data-table:hidden",
} as const

const alignment = { start: "text-start", center: "text-center", end: "text-end" } as const

/* A sticky cell takes the card's surface, tinted like its row, so the rows slide under it. */
const stickyCell = cn(
  "@max-[40rem]/data-table:sticky @max-[40rem]/data-table:z-[1] @max-[40rem]/data-table:bg-[var(--data-table-surface,var(--card))]",
  /* Once the rows scroll under it, the last sticky cell gets a hairline edge. */
  "@max-[40rem]/data-table:[[data-scroll-start]_&[data-sticky-edge]]:shadow-[inset_-1px_0_0_var(--border)]",
  /* The row's own translucent tint, layered over the surface, so a sticky cell matches its row exactly. */
  "@max-[40rem]/data-table:[tr:hover>&]:bg-[linear-gradient(color-mix(in_oklab,var(--data-table-accent,var(--foreground))_3%,transparent),color-mix(in_oklab,var(--data-table-accent,var(--foreground))_3%,transparent))]",
  "@max-[40rem]/data-table:[tr[data-selected]>&]:bg-[linear-gradient(color-mix(in_oklab,var(--data-table-accent,var(--foreground))_6%,transparent),color-mix(in_oklab,var(--data-table-accent,var(--foreground))_6%,transparent))]",
)

function columnClass(column: DataTableColumnDef<never>, selectable: boolean) {
  return cn(
    alignment[column.align ?? "start"],
    column.hideBelow && hideBelow[column.hideBelow],
    column.sticky && [stickyCell, selectable ? "@max-[40rem]/data-table:left-10" : "@max-[40rem]/data-table:left-0"],
    column.className,
  )
}

/* ---------------------------------------------------------------- root */

/** The whole list screen from `data` and `columns`, or the parts you compose inside. */
function DataTable<Row>({
  speed,
  className,
  style,
  children,
  data,
  columns,
  getRowId,
  searchPlaceholder,
  rowActions,
  bulkActions,
  toolbar,
  emptyTitle,
  emptyDescription,
  ...props
}: DataTableProps<Row>) {
  return (
    <Speed speed={speed}>
      <DataTableRoot
        data={data as unknown[]}
        columns={columns as DataTableColumn[]}
        getRowId={getRowId as DataTableOptions["getRowId"]}
        className={cn("gap-3 text-[13px] text-foreground", typeof className === "string" ? className : undefined)}
        style={style}
        {...props}
      >
        {children ?? (
          <>
            <DataTableToolbar searchPlaceholder={searchPlaceholder}>{toolbar}</DataTableToolbar>
            <DataTableContent rowActions={rowActions as ((row: unknown) => React.ReactNode) | undefined} emptyTitle={emptyTitle} emptyDescription={emptyDescription} />
            <DataTableBulkBar>{bulkActions ? (selected) => bulkActions(selected) : null}</DataTableBulkBar>
            <DataTableFooter />
          </>
        )}
      </DataTableRoot>
    </Speed>
  )
}

/* ---------------------------------------------------------------- toolbar */

/** Search, the filter chips, Reset, then anything you pass and View. It wraps on a narrow container. */
function DataTableToolbar({ searchPlaceholder, className, children }: { searchPlaceholder?: string; className?: string; children?: React.ReactNode }) {
  return (
    <DataTableToolbarPrimitive className={cn("flex flex-wrap items-center gap-2 [--filter-height:var(--data-table-control,2rem)]", className)}>
      <DataTableSearch placeholder={searchPlaceholder} />
      <DataTableFilters />
      <DataTableReset />
      <div className="ms-auto flex items-center gap-2">
        {children}
        <DataTableView />
      </div>
    </DataTableToolbarPrimitive>
  )
}

/** The search field, with a clear button while it holds text. */
function DataTableSearch({ placeholder = "Search…", className }: { placeholder?: string; className?: string }) {
  const api = useDataTable()
  return (
    <DataTableSearchPrimitive className={cn("w-[15rem] @max-[40rem]/data-table:w-full", className)}>
      {(state) => (
        <InputGroup className="h-[var(--data-table-control,2rem)] min-h-0 [--input-group-height:var(--data-table-control,2rem)]">
          <InputGroupAddon>
            <Search {...icon} />
          </InputGroupAddon>
          <InputGroupInput
            data-data-table-search=""
            aria-label={state.label}
            placeholder={placeholder}
            value={state.value}
            disabled={state.disabled}
            onValueChange={(value: string, details: { event?: Event }) => api.setSearch(value, details.event ?? new Event("input"))}
          />
          {state.value ? (
            <InputGroupAddon align="inline-end">
              <InputGroupButton size="icon-xs" aria-label="Clear search" onClick={(event) => api.clearSearch(event.nativeEvent)}>
                <X {...icon} />
              </InputGroupButton>
            </InputGroupAddon>
          ) : null}
        </InputGroup>
      )}
    </DataTableSearchPrimitive>
  )
}

/** A filter chip per filterable column, with the number of rows each value would leave. */
function DataTableFilters({ className }: { className?: string }) {
  const api = useDataTable()
  return (
    <DataTableFiltersPrimitive className={cn("contents", className)}>
      {(state) =>
        state.items.map((item) => (
          <Filter
            key={item.id}
            data-filter={item.id}
            label={item.title}
            options={item.options.map((o) => ({ value: o.value, label: o.label, count: o.count, icon: o.icon as React.ReactNode }))}
            value={item.selected}
            onValueChange={(value: string[]) => api.setFilter(item.id, value, new Event("change"))}
          />
        ))
      }
    </DataTableFiltersPrimitive>
  )
}

/** Clears the search and every filter. It slides in only while something is filtered. */
function DataTableReset({ className, children = "Reset" }: { className?: string; children?: React.ReactNode }) {
  const api = useDataTable()
  return (
    <DataTableResetPrimitive className={className}>
      <Button variant="ghost" size="sm" data-data-table-reset="" className="h-[var(--data-table-control,2rem)] bg-none shadow-none dark:bg-none dark:shadow-none" onClick={(event) => api.resetFilters(event.nativeEvent)}>
        {children}
        <X {...icon} />
      </Button>
    </DataTableResetPrimitive>
  )
}

/** "View": a menu of the columns, each with a check while it shows. */
function DataTableView({ className, label = "View" }: { className?: string; label?: string }) {
  const api = useDataTable()
  return (
    <DataTableViewPrimitive className={className}>
      {(state) => (
        <Menu>
          <MenuTrigger data-data-table-view="" className="h-[var(--data-table-control,2rem)] @max-[30rem]/data-table:px-2">
            <Settings2 {...icon} />
            <span className="@max-[30rem]/data-table:sr-only">{label}</span>
          </MenuTrigger>
          <MenuContent align="end" className="w-48">
            <MenuGroup>
              <MenuGroupLabel>Toggle columns</MenuGroupLabel>
              {state.columns.map((column) => (
                <MenuCheckboxItem
                  key={column.id}
                  value={column.id}
                  checked={column.visible}
                  onCheckedChange={(checked: boolean) => (checked ? api.showColumn(column.id, new Event("change")) : api.hideColumn(column.id, new Event("change")))}
                >
                  {column.label}
                  <MenuItemIndicator />
                </MenuCheckboxItem>
              ))}
            </MenuGroup>
          </MenuContent>
        </Menu>
      )}
    </DataTableViewPrimitive>
  )
}

/* ---------------------------------------------------------------- the table */

/** A header that sorts and hides from a small menu: Asc, Desc, Hide. A column that doesn't sort shows its label. */
function DataTableColumnHeader({ id, label, sort, sortable, hideable, align }: { id: string; label: string; sort: "ascending" | "descending" | "none"; sortable: boolean; hideable: boolean; align?: "start" | "center" | "end" }) {
  const api = useDataTable()
  if (!sortable && !hideable) return <span className="px-0.5">{label}</span>
  const SortIcon = sort === "ascending" ? ArrowUp : sort === "descending" ? ArrowDown : ChevronsUpDown
  /* For a column whose values end on the right, the icon goes first so the label ends where the numbers end. */
  const sortIcon = (
    <SortIcon
      {...icon}
      className={cn(
        "size-3.5 transition-[opacity,rotate] duration-[calc(420ms*var(--kf-speed,1))] ease-spring motion-reduce:transition-none",
        sort === "none" && "opacity-45",
      )}
    />
  )
  return (
    <Menu
      onAction={(value: string) => {
        const event = new Event("select")
        if (value === "asc") api.setSort(id, "ascending", event)
        else if (value === "desc") api.setSort(id, "descending", event)
        else if (value === "hide") api.hideColumn(id, event)
      }}
    >
      <MenuTrigger
        data-data-table-sort={id}
        aria-label={`${label}, ${sort === "none" ? "not sorted" : `sorted ${sort}`}. Sort or hide`}
        render={<Button variant="ghost" size="sm" />}
        className={cn(
          "-mx-1.5 h-7 gap-1 bg-none px-1.5 text-[12px] font-medium text-[color:inherit] shadow-none dark:bg-none dark:shadow-none data-open:bg-accent",
        )}
      >
        {align === "end" ? (
          <>
            {sortIcon}
            {label}
          </>
        ) : (
          <>
            {label}
            {sortIcon}
          </>
        )}
      </MenuTrigger>
      <MenuContent align={align === "end" ? "end" : "start"} className="w-36">
        {sortable ? (
          <>
            <MenuItem value="asc" data-value="asc">
              <MenuItemIcon>
                <ArrowUp {...icon} />
              </MenuItemIcon>
              Asc
            </MenuItem>
            <MenuItem value="desc" data-value="desc">
              <MenuItemIcon>
                <ArrowDown {...icon} />
              </MenuItemIcon>
              Desc
            </MenuItem>
          </>
        ) : null}
        {sortable && hideable ? <MenuSeparator /> : null}
        {hideable ? (
          <MenuItem value="hide" data-value="hide">
            <MenuItemIcon>
              <EyeOff {...icon} />
            </MenuItemIcon>
            Hide
          </MenuItem>
        ) : null}
      </MenuContent>
    </Menu>
  )
}

/* Loading bars vary their width row to row, so they read as text, not a grid. */
const barWidths = ["72%", "54%", "64%", "46%", "68%", "58%"]

/** The table in its card: headers, rows (or the loading rows, or the empty state). */
function DataTableContent({
  rowActions,
  emptyTitle = "No results",
  emptyDescription,
  className,
}: {
  rowActions?: (row: never) => React.ReactNode
  emptyTitle?: string
  emptyDescription?: string
  className?: string
}) {
  return (
    <DataTableContentPrimitive
      className={cn(
        "overflow-hidden rounded-[var(--data-table-radius,14px)] bg-[var(--data-table-surface,var(--card))]",
        "shadow-[0_0_0_1px_var(--data-table-border,rgb(0_0_0/0.07)),0_1px_2px_rgb(0_0_0/0.04)] dark:shadow-[0_0_0_1px_var(--data-table-border,rgb(255_255_255/0.08))]",
        "[--table-height:var(--data-table-row-height,2.75rem)] [--table-accent:var(--data-table-accent,var(--foreground))]",
        /* On a narrow container the first columns stay put, so the scroll edge needs no fade. */
        "@max-[40rem]/data-table:[&_[data-slot=table-container]]:[mask-image:none]",
        className,
      )}
    >
      {(state) => <ContentTable state={state} rowActions={rowActions as ((row: unknown) => React.ReactNode) | undefined} emptyTitle={emptyTitle} emptyDescription={emptyDescription} />}
    </DataTableContentPrimitive>
  )
}

type ContentState = Parameters<Extract<React.ComponentProps<typeof DataTableContentPrimitive>["children"], (state: never) => unknown>>[0]

function ContentTable({
  state,
  rowActions,
  emptyTitle,
  emptyDescription,
}: {
  state: ContentState
  rowActions?: (row: unknown) => React.ReactNode
  emptyTitle: string
  emptyDescription?: string
}) {
  const api = useDataTable()
  const all = state.allColumns as DataTableColumnDef<never>[]
  const { columns, ref } = useColumnPresence(all, state.columns as DataTableColumnDef<never>[])
  const span = columns.length + (state.selectable ? 1 : 0) + (rowActions ? 1 : 0)
  const edge = "first:ps-4 last:pe-4"

  return (
    <Table aria-label={state.label || undefined} ref={ref as React.Ref<HTMLTableElement>}>
      <TableHeader>
        <TableRow>
          {state.selectable ? (
            <TableHead className={cn("w-10 ps-4", stickyCell, "@max-[40rem]/data-table:left-0")}>
              <Checkbox
                aria-label="Select every row on this page"
                data-data-table-select-all=""
                disabled={state.loading || !state.entries.length}
                checked={state.pageSelection === "all" ? true : state.pageSelection === "some" ? "indeterminate" : false}
                onCheckedChange={(_checked: unknown, details: { event?: Event }) => api.togglePage(details.event)}
              />
            </TableHead>
          ) : null}
          {columns.map(({ column, leaving }) => {
            const sortable = column.sortable ?? true
            const hideable = column.hideable ?? true
            const sort = state.sort?.id === column.id ? state.sort.direction : "none"
            return (
              <DataTableHeadPrimitive
                key={column.id}
                value={column.id}
                data-leaving={leaving ? "" : undefined}
                data-sticky-edge={column.sticky ? "" : undefined}
                aria-hidden={leaving ? "true" : undefined}
                render={<TableHead />}
                className={cn(dataTableCellMotion, edge, columnClass(column, state.selectable))}
              >
                <div data-data-table-cell="" className={cn("flex items-center", column.align === "end" && "justify-end", column.align === "center" && "justify-center")}>
                  <DataTableColumnHeader id={column.id} label={column.header} sort={sort} sortable={sortable} hideable={hideable} align={column.align} />
                </div>
              </DataTableHeadPrimitive>
            )
          })}
          {rowActions ? (
            <TableHead className="w-12 pe-3">
              <span className="sr-only">Actions</span>
            </TableHead>
          ) : null}
        </TableRow>
      </TableHeader>
      <TableBody className={dataTableBodyMotion}>
        {state.loading ? (
          Array.from({ length: Math.min(state.pageSize, 12) }, (_, r) => (
            <TableRow key={`loading-${r}`} className="hover:bg-transparent" aria-hidden="true">
              {state.selectable ? (
                <TableCell className="ps-4">
                  <Skeleton className="size-4 rounded-[5px]" />
                </TableCell>
              ) : null}
              {columns.map(({ column }, c) => (
                <TableCell key={column.id} className={cn(edge, columnClass(column, state.selectable))}>
                  <Skeleton className={cn("h-3", column.align === "end" && "ms-auto")} style={{ width: barWidths[(r + c * 2) % barWidths.length] }} />
                </TableCell>
              ))}
              {rowActions ? <TableCell /> : null}
            </TableRow>
          ))
        ) : state.empty ? (
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={span} className="h-auto p-0 whitespace-normal">
              <DataTableEmpty title={emptyTitle} description={emptyDescription} />
            </TableCell>
          </TableRow>
        ) : (
          state.entries.map((entry) => {
            const label = api.rowLabel(entry.id)
            return (
              <DataTableRowPrimitive key={`${state.epoch}:${entry.id}`} value={entry.id} render={<TableRow />}>
                {state.selectable ? (
                  <TableCell className={cn("w-10 ps-4", stickyCell, "@max-[40rem]/data-table:left-0")}>
                    <Checkbox
                      aria-label={`Select ${label}`}
                      data-data-table-select={entry.id}
                      checked={state.selected.includes(entry.id)}
                      onCheckedChange={(_checked: unknown, details: { event?: Event }) => api.toggleRow(entry.id, details.event)}
                    />
                  </TableCell>
                ) : null}
                {columns.map(({ column, leaving }) => {
                  const value = valueOf(column as DataTableColumn, entry.row)
                  return (
                    <TableCell
                      key={column.id}
                      data-leaving={leaving ? "" : undefined}
                      data-sticky-edge={column.sticky ? "" : undefined}
                      aria-hidden={leaving ? "true" : undefined}
                      className={cn(dataTableCellMotion, edge, columnClass(column, state.selectable))}
                    >
                      <div data-data-table-cell="">{column.cell ? (column.cell as (row: unknown, value: unknown) => React.ReactNode)(entry.row, value) : textOf(value)}</div>
                    </TableCell>
                  )
                })}
                {rowActions ? (
                  <TableCell className="w-12 pe-3 text-end">
                    <Menu>
                      <MenuTrigger
                        data-data-table-row-menu={entry.id}
                        aria-label={`Actions for ${label}`}
                        render={<Button variant="ghost" size="icon-sm" />}
                        className="ms-auto bg-none text-muted-foreground shadow-none dark:bg-none hover:text-foreground data-open:bg-accent data-open:text-foreground dark:shadow-none"
                      >
                        <Ellipsis {...icon} />
                      </MenuTrigger>
                      <MenuContent align="end" className="w-44">
                        {rowActions(entry.row)}
                      </MenuContent>
                    </Menu>
                  </TableCell>
                ) : null}
              </DataTableRowPrimitive>
            )
          })
        )}
      </TableBody>
    </Table>
  )
}

/** "No results", with a button that clears the search and the filters. */
function DataTableEmpty({ title = "No results", description, className }: { title?: string; description?: string; className?: string }) {
  const api = useDataTable()
  return (
    <DataTableEmptyPrimitive className={className}>
      {(state) => (
        <Empty className="py-12">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SearchX {...icon} className="size-5" />
            </EmptyMedia>
            <EmptyTitle>{title}</EmptyTitle>
            <EmptyDescription>
              {description ?? (state.search.trim() ? `Nothing matches “${state.search.trim()}”.` : "No rows match these filters.")}
            </EmptyDescription>
          </EmptyHeader>
          {state.filtered ? (
            <EmptyContent>
              <Button size="sm" data-data-table-clear="" onClick={(event) => api.resetFilters(event.nativeEvent)}>
                Clear filters
              </Button>
            </EmptyContent>
          ) : null}
        </Empty>
      )}
    </DataTableEmptyPrimitive>
  )
}

/* ---------------------------------------------------------------- footer */

/** The selection count, "Rows per page", "Page X of Y" and the pages. First and last leave on a narrow container. */
function DataTableFooter({ className, label = "rows" }: { className?: string; label?: string }) {
  const api = useDataTable()
  return (
    <DataTableFooterPrimitive className={cn("flex flex-wrap items-center gap-x-6 gap-y-3 px-1 text-[13px] text-muted-foreground tabular-nums", className)}>
      {(state) => (
        <>
          <div className="me-auto @max-[40rem]/data-table:hidden">
            {state.selectable && state.selectedCount ? (
              <>
                <PaginationRoll value={state.selectedCount} /> of {state.total} selected
              </>
            ) : (
              <>
                <PaginationRoll value={state.total} /> {label}
              </>
            )}
          </div>
          <div className="flex items-center gap-2 @max-[30rem]/data-table:hidden">
            <span className="font-medium text-foreground">Rows per page</span>
            <Select value={String(state.pageSize)} onValueChange={(value: string | null) => value && api.setPageSize(Number(value), new Event("change"))}>
              <SelectTrigger aria-label="Rows per page" data-data-table-page-size="" className="h-8 w-[4.5rem] [--select-height:2rem]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {state.pageSizes.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    <SelectItemText>{size}</SelectItemText>
                    <SelectItemIndicator />
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="font-medium text-foreground @max-[40rem]/data-table:me-auto">
            Page <PaginationRoll value={state.page} /> of {state.pageCount}
          </div>
          <Pagination
            aria-label="Pages"
            total={state.total}
            pageSize={state.pageSize}
            page={state.page}
            onPageChange={(page: number) => api.setPage(page, new Event("change"))}
          >
            <PaginationList className="@max-[30rem]/data-table:before:opacity-0!">
              {({ items }) => (
                <>
                  <PaginationItem className="@max-[40rem]/data-table:hidden">
                    <PaginationFirst />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationPrevious data-data-table-previous="" />
                  </PaginationItem>
                  {items.map((item) => (
                    <PaginationItem key={item} className="@max-[30rem]/data-table:hidden">
                      {typeof item === "number" ? <PaginationLink page={item} /> : <PaginationEllipsis />}
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext data-data-table-next="" />
                  </PaginationItem>
                  <PaginationItem className="@max-[40rem]/data-table:hidden">
                    <PaginationLast />
                  </PaginationItem>
                </>
              )}
            </PaginationList>
          </Pagination>
        </>
      )}
    </DataTableFooterPrimitive>
  )
}

/* ---------------------------------------------------------------- bulk bar */

/** Rises from the bottom centre while rows are selected: clear (or Escape), "N selected", then your actions.
    Place it right after `DataTableContent`: it opens a room of its own there while rows are selected. */
function DataTableBulkBar({ className, children }: { className?: string; children?: React.ReactNode | ((selected: string[]) => React.ReactNode) }) {
  const api = useDataTable()
  /* While it sinks away the count keeps its last number instead of rolling to 0. */
  const last = React.useRef({ count: 0, selected: [] as string[] })
  return (
    <DataTableBulkBarPrimitive className={className}>
      {(state) => {
        if (state.count) last.current = { count: state.count, selected: state.selected }
        const { count, selected } = last.current
        return (
          <Toolbar
            aria-label="Selected rows"
            data-data-table-bulk=""
            className="gap-1 rounded-[14px] bg-[var(--data-table-bar,var(--popover))] p-1.5 whitespace-nowrap"
          >
            <ToolbarButton aria-label="Clear selection (Escape)" data-data-table-bulk-clear="" onClick={(event) => api.clearSelection(event.nativeEvent)}>
              <X {...icon} />
            </ToolbarButton>
            <span className="px-1.5 text-[13px] font-medium text-foreground tabular-nums" aria-live="off">
              <Roll text={String(count)} /> selected
            </span>
            {children ? <ToolbarSeparator /> : null}
            {typeof children === "function" ? children(selected) : children}
          </Toolbar>
        )
      }}
    </DataTableBulkBarPrimitive>
  )
}

/** One action in the bulk bar: an `icon` and a `label` (the label folds away on a narrow
    container and stays for screen readers). `tone="destructive"` for one that removes. */
function DataTableBulkAction({
  tone,
  icon: actionIcon,
  label,
  className,
  children,
  ...props
}: React.ComponentProps<typeof ToolbarButton> & { tone?: "destructive"; icon?: React.ReactNode; label?: string }) {
  return (
    <ToolbarButton
      title={label}
      className={cn(
        /* Ordinary actions in full ink, their icon a step quieter; only a destructive one is red. */
        "px-2 text-foreground not-data-disabled:hover:text-foreground [&_svg]:size-4 [&_svg]:text-muted-foreground",
        tone === "destructive" && "text-destructive not-data-disabled:hover:text-destructive data-kf-toolbar-hl:text-destructive [&_svg]:text-destructive",
        typeof className === "string" ? className : undefined,
      )}
      {...props}
    >
      {children ?? (
        <>
          {actionIcon}
          <span className="@max-[34rem]/data-table:sr-only">{label}</span>
        </>
      )}
    </ToolbarButton>
  )
}

export {
  DataTable,
  DataTableBulkAction,
  DataTableBulkBar,
  DataTableColumnHeader,
  type DataTableColumnDef,
  DataTableContent,
  DataTableEmpty,
  DataTableFilters,
  DataTableFooter,
  type DataTableProps,
  DataTableReset,
  DataTableSearch,
  DataTableToolbar,
  DataTableView,
}
