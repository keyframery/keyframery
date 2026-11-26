"use client"

/* Animated table, on UI SDK's core. UI SDK ships no table, so the behaviour is defined in
   `@/components/core/table` with `definePrimitive` and rendered here, with shadcn's part names
   (Table, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell, TableCaption): swap
   the import and keep your markup. This file adds motion only. Colours, borders and spacing stay yours.

   - Cascade: rows arrive one after another when the body first shows, and new rows do the same when
     the data changes (a new page, a filter). Rows that only move, like after a sort, don't replay.
   - Spring: a sortable header's arrow turns over on a spring when the direction flips.
   - Fade: a row's hover and selected colours fade in and out.
   - Direction: on a narrow screen the table scrolls sideways inside its container, and a soft
     edge shows there is more to the side you can scroll toward. */

import type { StateOf } from "@ui-sdk/core"
import { createParts, type PartProps, usePart, usePrimitive } from "@ui-sdk/react/primitive"
import * as React from "react"

import { type SortDirection, table, tableHead, type TableHeadOptions } from "@/components/core/table"
import { cn } from "@/lib/utils"

const {
  Header: TableHeader,
  Body: TableBodyPart,
  Footer: TableFooter,
  Row: TableRowPart,
  Cell: TableCell,
  Caption: TableCaption,
} = createParts(table, { header: "thead", body: "tbody", footer: "tfoot", row: "tr", cell: "td", caption: "caption" })

/* Adds this file's classes to the caller's, which may be a function of the part's state. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

/* Keyframes with a backwards fill, so a row is hidden on its first frame and the delay never
   slows a later hover. The first twelve rows are staggered; the rest arrive with the twelfth. */
const keyframes =
  "@keyframes kf-table-row{from{opacity:0;translate:0 6px;filter:blur(3px)}}" +
  Array.from({ length: 12 }, (_, i) => `[data-slot=table-body]>tr:nth-child(${i + 1}){--kf-row:${i}}`).join("") +
  "[data-slot=table-body]>tr:nth-child(n+13){--kf-row:12}"

/* The edge the container can still scroll toward fades out. */
const containerMotion = cn(
  "relative w-full overflow-x-auto overscroll-x-contain",
  "data-scroll-end:[mask-image:linear-gradient(to_right,#000_calc(100%-28px),transparent)]",
  "data-scroll-start:[mask-image:linear-gradient(to_right,transparent,#000_28px)]",
  "data-scroll-start:data-scroll-end:[mask-image:linear-gradient(to_right,transparent,#000_28px,#000_calc(100%-28px),transparent)]",
)

/* The table sits in a container that scrolls sideways when the table is wider than it. The
   container is a part too (`table-container`), and marks the sides it can scroll toward with
   `data-scroll-start` and `data-scroll-end`. */
function Table({ className, ...props }: PartProps<"table", StateOf<typeof table, "root">>) {
  const handle = usePrimitive(table, {})
  const inner = usePart(handle, "root", {}, { ...props, className: withClass("w-full caption-bottom", className) }, "table")
  const container = usePart(handle, "container", {}, { className: containerMotion, children: inner }, "div")
  return (
    <>
      <style href="kf-table" precedence="default">
        {keyframes}
      </style>
      {container}
    </>
  )
}

/* Rows cascade in. The animation runs once per row element, so a row React keeps (a sort, an
   edit) doesn't replay; a row with a new key (a new page) does. The cascade scales with
   --kf-flourish: at 0 the rows are simply there. */
function TableBody({ className, ...props }: React.ComponentProps<typeof TableBodyPart>) {
  return (
    <TableBodyPart
      className={withClass(
        cn(
          "[&>tr]:animate-[kf-table-row_calc(380ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-spring)_backwards]",
          "[&>tr]:[animation-delay:calc(var(--kf-row,0)*28ms*var(--kf-speed,1)*var(--kf-flourish,1))]",
          "motion-reduce:[&>tr]:animate-none",
        ),
        className,
      )}
      {...props}
    />
  )
}

/* Hover and selection fade. `selected` sets `aria-selected` and `data-selected` for the styles. */
function TableRow({ className, ...props }: React.ComponentProps<typeof TableRowPart>) {
  return (
    <TableRowPart
      className={withClass(
        "transition-[background-color] duration-[calc(160ms*var(--kf-speed,1))] ease-house motion-reduce:transition-none",
        className,
      )}
      {...props}
    />
  )
}

/* A sortable header holds a button, so the whole label is the target. The arrow turns over on a
   spring when the direction flips, and fades in when the column becomes the sorted one. */
function TableHead({
  sort,
  defaultSort,
  onSort,
  onSortChange,
  className,
  children,
  ...props
}: TableHeadOptions & Omit<PartProps<"th", StateOf<typeof tableHead, "head">>, "children"> & { children?: React.ReactNode }) {
  const handle = usePrimitive(tableHead, { sort, defaultSort, onSort, onSortChange })
  const arrow = usePart(
    handle,
    "sort-arrow",
    {},
    {
      viewBox: "0 0 16 16",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: 1.5,
      strokeLinecap: "round",
      strokeLinejoin: "round",
      className: cn(
        "transition-[rotate,opacity] duration-[calc(420ms*var(--kf-speed,1))] ease-spring motion-reduce:transition-none",
        "data-[sort=descending]:rotate-180 data-[sort=none]:opacity-0",
      ),
      children: <path d="M8 12.5v-9M4.5 7 8 3.5 11.5 7" />,
    },
    "svg",
  )
  const button = usePart(
    handle,
    "sort",
    {},
    {
      children: (
        <>
          {children}
          {arrow}
        </>
      ),
    },
    "button",
  )
  return usePart(
    handle,
    "head",
    {},
    { ...props, className, children: (state) => (state.sortable ? button : children) },
    "th",
  )
}

export { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow, type SortDirection }
