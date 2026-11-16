"use client"

/* Animated table. UI SDK has no table, so these are plain table elements with the shadcn part names
   (Table, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell, TableCaption): swap
   the import and keep your markup. This file adds motion only. Colours, borders and spacing stay yours.

   - Cascade: rows arrive one after another when the body first shows, and new rows do the same when
     the data changes (a new page, a filter). Rows that only move, like after a sort, don't replay.
   - Spring: a sortable header's arrow turns over on a spring when the direction flips.
   - Fade: a row's hover and selected colours fade in and out.
   - Direction: on a narrow screen the table scrolls sideways inside its container, and a soft
     edge shows there is more to the side you can scroll toward. */

import * as React from "react"

import { cn } from "@/lib/utils"

/* Keyframes with a backwards fill, so a row is hidden on its first frame and the delay never
   slows a later hover. The first twelve rows are staggered; the rest arrive with the twelfth. */
const keyframes =
  "@keyframes kf-table-row{from{opacity:0;translate:0 6px;filter:blur(3px)}}" +
  Array.from({ length: 12 }, (_, i) => `[data-slot=table-body]>tr:nth-child(${i + 1}){--kf-row:${i}}`).join("") +
  "[data-slot=table-body]>tr:nth-child(n+13){--kf-row:12}"

type Edges = { start: boolean; end: boolean }

function Table({ className, ...props }: React.ComponentProps<"table">) {
  /* The container scrolls sideways when the table is wider than it. The edges it can scroll toward
     are marked, so the styled table can fade them. */
  const scroller = React.useRef<HTMLDivElement>(null)
  const [edges, setEdges] = React.useState<Edges>({ start: false, end: false })
  React.useEffect(() => {
    const el = scroller.current
    if (!el) return
    const measure = () => {
      const max = el.scrollWidth - el.clientWidth
      const at = Math.abs(el.scrollLeft)
      setEdges({ start: at > 1, end: max - at > 1 })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    if (el.firstElementChild) ro.observe(el.firstElementChild)
    el.addEventListener("scroll", measure, { passive: true })
    return () => {
      ro.disconnect()
      el.removeEventListener("scroll", measure)
    }
  }, [])
  return (
    <>
      <style href="kf-table" precedence="default">
        {keyframes}
      </style>
      <div
        ref={scroller}
        data-slot="table-container"
        data-scroll-start={edges.start || undefined}
        data-scroll-end={edges.end || undefined}
        className={cn(
          "relative w-full overflow-x-auto overscroll-x-contain",
          "data-scroll-end:[mask-image:linear-gradient(to_right,#000_calc(100%-28px),transparent)]",
          "data-scroll-start:[mask-image:linear-gradient(to_right,transparent,#000_28px)]",
          "data-scroll-start:data-scroll-end:[mask-image:linear-gradient(to_right,transparent,#000_28px,#000_calc(100%-28px),transparent)]",
        )}
      >
        <table data-slot="table" className={cn("w-full caption-bottom", className)} {...props} />
      </div>
    </>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return <thead data-slot="table-header" className={cn(className)} {...props} />
}

/* Rows cascade in. The animation runs once per row element, so a row React keeps (a sort, an
   edit) doesn't replay; a row with a new key (a new page) does. */
function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn(
        "[&>tr]:animate-[kf-table-row_calc(380ms*var(--kf-speed,1))_var(--ease-spring)_backwards]",
        "[&>tr]:[animation-delay:calc(var(--kf-row,0)*28ms*var(--kf-speed,1))]",
        "motion-reduce:[&>tr]:animate-none",
        className,
      )}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return <tfoot data-slot="table-footer" className={cn(className)} {...props} />
}

/* Hover and selection fade. `selected` sets aria-selected and data-selected for the styles. */
function TableRow({
  className,
  selected,
  ...props
}: React.ComponentProps<"tr"> & {
  /** Marks the row as selected: sets `aria-selected` and `data-selected`, and its colour fades in. */
  selected?: boolean
}) {
  return (
    <tr
      data-slot="table-row"
      data-selected={selected || undefined}
      aria-selected={selected}
      className={cn(
        "transition-[background-color] duration-[calc(160ms*var(--kf-speed,1))] ease-house motion-reduce:transition-none",
        className,
      )}
      {...props}
    />
  )
}

type SortDirection = "ascending" | "descending" | "none"

/* A sortable header holds a button, so the whole label is the target. The arrow turns over on a
   spring when the direction flips, and fades in when the column becomes the sorted one. */
function TableHead({
  className,
  children,
  sort,
  onSort,
  ...props
}: React.ComponentProps<"th"> & {
  /** How this column is sorted. Pass it with `onSort` to make the header a sort button. */
  sort?: SortDirection
  /** Runs when the header is pressed. Flip `sort` here. */
  onSort?: () => void
}) {
  const sortable = onSort !== undefined
  return (
    <th
      data-slot="table-head"
      data-sort={sortable ? (sort ?? "none") : undefined}
      aria-sort={sortable ? (sort ?? "none") : undefined}
      className={cn(className)}
      {...props}
    >
      {sortable ? (
        <button type="button" data-slot="table-sort" onClick={onSort}>
          {children}
          <svg
            data-slot="table-sort-arrow"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className={cn(
              "transition-[rotate,opacity] duration-[calc(420ms*var(--kf-speed,1))] ease-spring motion-reduce:transition-none",
              sort === "descending" && "rotate-180",
              (!sort || sort === "none") && "opacity-0",
            )}
          >
            <path d="M8 12.5v-9M4.5 7 8 3.5 11.5 7" />
          </svg>
        </button>
      ) : (
        children
      )}
    </th>
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return <td data-slot="table-cell" className={cn(className)} {...props} />
}

function TableCaption({ className, ...props }: React.ComponentProps<"caption">) {
  return <caption data-slot="table-caption" className={cn(className)} {...props} />
}

export { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow, type SortDirection }
