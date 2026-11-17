"use client"

export * from "@/components/primitives/table"

/* Styled table: the animated primitive plus the Keyframery look. Same parts as shadcn/ui's table,
   with `sort` and `onSort` (or `defaultSort` and `onSortChange`) on a header and `selected` on a row. */

/* Theming: inherit these optional variables; unset values retain the original light/dark tokens.
   --table-ink: Table text (default: --foreground).
   --table-muted: Headers and caption text (default: --muted-foreground).
   --table-border: Row and footer rules (default: --border; 70% on rows).
   --table-accent: Hover and selection tint (default: --foreground at 3% on hover and 6% when selected).
   --table-footer: Footer fill (default: --muted at 40%).
   --table-height: Body cell height (default: 2.75rem).
   --table-padding: Cell horizontal padding (default: 0.75rem).
   --table-radius: Sort button corners (default: 7px).
 */

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

/* Adds the look to the caller's classes, which may be a function of the part's state. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

function Table({ speed, className, ...props }: React.ComponentProps<typeof TablePrimitive> & SpeedProps) {
  return (
    <Speed speed={speed}>
      <TablePrimitive className={withClass("text-[13px] text-[color:var(--table-ink,var(--foreground))] tabular-nums", className)} {...props} />
    </Speed>
  )
}

/* Quiet labels over a hairline. */
function TableHeader({ className, ...props }: React.ComponentProps<typeof TableHeaderPrimitive>) {
  return <TableHeaderPrimitive className={withClass("[&_tr]:border-b [&_tr]:hover:bg-transparent", className)} {...props} />
}

function TableBody({ className, ...props }: React.ComponentProps<typeof TableBodyPrimitive>) {
  return <TableBodyPrimitive className={withClass("[&_tr:last-child]:border-0", className)} {...props} />
}

function TableFooter({ className, ...props }: React.ComponentProps<typeof TableFooterPrimitive>) {
  return (
    <TableFooterPrimitive
      className={withClass("border-t border-[color:var(--table-border,var(--border))] bg-[var(--table-footer,color-mix(in_oklab,var(--muted)_40%,transparent))] font-medium [&>tr]:last:border-b-0 [&_tr]:hover:bg-transparent", className)}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<typeof TableRowPrimitive>) {
  return (
    <TableRowPrimitive
      className={withClass(
        cn(
          "border-b border-[color:color-mix(in_oklab,var(--table-border,var(--border))_70%,transparent)] hover:bg-[color-mix(in_oklab,var(--table-accent,var(--foreground))_3%,transparent)]",
          "data-selected:bg-[color-mix(in_oklab,var(--table-accent,var(--foreground))_6%,transparent)]",
        ),
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
      className={withClass(
        cn(
          "h-9 px-[var(--table-padding,0.75rem)] text-left align-middle text-[12px] font-medium whitespace-nowrap text-[color:var(--table-muted,var(--muted-foreground))]",
          "[&:has([role=checkbox])]:w-px [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:flex",
          "data-sort:px-1.5",
          "[&_[data-slot=table-sort]]:inline-flex [&_[data-slot=table-sort]]:h-7 [&_[data-slot=table-sort]]:cursor-pointer [&_[data-slot=table-sort]]:items-center [&_[data-slot=table-sort]]:gap-1 [&_[data-slot=table-sort]]:rounded-[var(--table-radius,7px)] [&_[data-slot=table-sort]]:px-1.5 [&_[data-slot=table-sort]]:outline-none",
          "[&_[data-slot=table-sort]]:transition-[color,background-color] [&_[data-slot=table-sort]]:duration-[calc(150ms*var(--kf-speed,1))] [&_[data-slot=table-sort]]:hover:bg-accent [&_[data-slot=table-sort]]:hover:text-[color:var(--table-ink,var(--foreground))]",
          "[&_[data-slot=table-sort]]:focus-visible:ring-2 [&_[data-slot=table-sort]]:focus-visible:ring-ring",
          "data-[sort=ascending]:text-[color:var(--table-ink,var(--foreground))] data-[sort=descending]:text-[color:var(--table-ink,var(--foreground))]",
          "[&_[data-slot=table-sort-arrow]]:size-3.5",
        ),
        className,
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<typeof TableCellPrimitive>) {
  return (
    <TableCellPrimitive
      className={withClass(
        "h-[var(--table-height,2.75rem)] px-[var(--table-padding,0.75rem)] align-middle whitespace-nowrap [&:has([role=checkbox])]:w-px [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:flex",
        className,
      )}
      {...props}
    />
  )
}

function TableCaption({ className, ...props }: React.ComponentProps<typeof TableCaptionPrimitive>) {
  return <TableCaptionPrimitive className={withClass("mt-3 text-[12px] text-[color:var(--table-muted,var(--muted-foreground))]", className)} {...props} />
}

export { type SortDirection } from "@/components/primitives/table"
export { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow }
