"use client"

/* Styled table: the animated primitive plus the Keyframery look. Same parts as shadcn/ui's table,
   with `sort` and `onSort` on a header and `selected` on a row. */

import * as React from "react"

import {
  Table as TablePrimitive,
  TableBody as TableBodyPrimitive,
  TableCaption as TableCaptionPrimitive,
  TableCell as TableCellPrimitive,
  TableFooter as TableFooterPrimitive,
  TableHead as TableHeadPrimitive,
  TableHeader as TableHeaderPrimitive,
  TableRow as TableRowPrimitive,
} from "@/components/primitives/table"
import { Speed, type SpeedProps } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

function Table({ speed, className, ...props }: React.ComponentProps<typeof TablePrimitive> & SpeedProps) {
  return (
    <Speed speed={speed}>
      <TablePrimitive className={cn("text-[13px] text-foreground tabular-nums", className)} {...props} />
    </Speed>
  )
}

/* Quiet labels over a hairline. */
function TableHeader({ className, ...props }: React.ComponentProps<typeof TableHeaderPrimitive>) {
  return <TableHeaderPrimitive className={cn("[&_tr]:border-b [&_tr]:hover:bg-transparent", className)} {...props} />
}

function TableBody({ className, ...props }: React.ComponentProps<typeof TableBodyPrimitive>) {
  return <TableBodyPrimitive className={cn("[&_tr:last-child]:border-0", className)} {...props} />
}

function TableFooter({ className, ...props }: React.ComponentProps<typeof TableFooterPrimitive>) {
  return (
    <TableFooterPrimitive
      className={cn("border-t bg-muted/40 font-medium [&>tr]:last:border-b-0 [&_tr]:hover:bg-transparent", className)}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<typeof TableRowPrimitive>) {
  return (
    <TableRowPrimitive
      className={cn(
        "border-b border-border/70 hover:bg-[color-mix(in_oklab,var(--foreground)_3%,transparent)]",
        "data-selected:bg-[color-mix(in_oklab,var(--foreground)_6%,transparent)]",
        className,
      )}
      {...props}
    />
  )
}

/* A sortable header's button fills the cell and lights up on hover. Numbers align right. */
function TableHead({ className, ...props }: React.ComponentProps<typeof TableHeadPrimitive>) {
  return (
    <TableHeadPrimitive
      className={cn(
        "h-9 px-3 text-left align-middle text-[12px] font-medium whitespace-nowrap text-muted-foreground",
        "[&:has([role=checkbox])]:w-px [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:flex",
        "data-sort:px-1.5",
        "[&_[data-slot=table-sort]]:inline-flex [&_[data-slot=table-sort]]:h-7 [&_[data-slot=table-sort]]:cursor-pointer [&_[data-slot=table-sort]]:items-center [&_[data-slot=table-sort]]:gap-1 [&_[data-slot=table-sort]]:rounded-[7px] [&_[data-slot=table-sort]]:px-1.5 [&_[data-slot=table-sort]]:outline-none",
        "[&_[data-slot=table-sort]]:transition-[color,background-color] [&_[data-slot=table-sort]]:duration-[calc(150ms*var(--kf-speed,1))] [&_[data-slot=table-sort]]:hover:bg-accent [&_[data-slot=table-sort]]:hover:text-foreground",
        "[&_[data-slot=table-sort]]:focus-visible:ring-2 [&_[data-slot=table-sort]]:focus-visible:ring-ring",
        "data-[sort=ascending]:text-foreground data-[sort=descending]:text-foreground",
        "[&_[data-slot=table-sort-arrow]]:size-3.5",
        className,
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<typeof TableCellPrimitive>) {
  return (
    <TableCellPrimitive
      className={cn("h-11 px-3 align-middle whitespace-nowrap [&:has([role=checkbox])]:w-px [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:flex", className)}
      {...props}
    />
  )
}

function TableCaption({ className, ...props }: React.ComponentProps<typeof TableCaptionPrimitive>) {
  return <TableCaptionPrimitive className={cn("mt-3 text-[12px] text-muted-foreground", className)} {...props} />
}

export { type SortDirection } from "@/components/primitives/table"
export { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow }
