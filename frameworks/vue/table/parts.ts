/* UI SDK parts for table, made once from the shared core definition (the same file React uses). */
import { createParts } from "@ui-sdk/vue/primitive"

import { table } from "@/components/keyframery/core/table-core"
import { cn } from "@/lib/utils"

/* Keyframes with a backwards fill, so a row is hidden on its first frame and the delay never
   slows a later hover. The first twelve rows are staggered; the rest arrive with the twelfth. */
const keyframes =
  "@keyframes kf-table-row{from{opacity:0;translate:0 6px;filter:blur(3px)}}" +
  Array.from({ length: 12 }, (_, i) => `[data-slot=table-body]>tr:nth-child(${i + 1}){--kf-row:${i}}`).join("") +
  "[data-slot=table-body]>tr:nth-child(n+13){--kf-row:12}"
if (typeof document !== "undefined" && !document.getElementById("kf-table")) {
  const s = document.createElement("style")
  s.id = "kf-table"
  s.textContent = keyframes
  document.head.append(s)
}

export const {
  Header: TableHeaderPart,
  Body: TableBodyPart,
  Footer: TableFooterPart,
  Row: TableRowPart,
  Cell: TableCellPart,
  Caption: TableCaptionPart,
} = createParts(table, { header: "thead", body: "tbody", footer: "tfoot", row: "tr", cell: "td", caption: "caption" })

/* The edge the container can still scroll toward fades out. */
export const containerMotion = cn(
  "relative w-full overflow-x-auto overscroll-x-contain",
  "data-scroll-end:[mask-image:linear-gradient(to_right,#000_calc(100%-28px),transparent)]",
  "data-scroll-start:[mask-image:linear-gradient(to_right,transparent,#000_28px)]",
  "data-scroll-start:data-scroll-end:[mask-image:linear-gradient(to_right,transparent,#000_28px,#000_calc(100%-28px),transparent)]",
)

export const tableClass = cn("w-full caption-bottom", "text-[13px] text-[color:var(--table-ink,var(--foreground))] tabular-nums")

export const headerClass = "[&_tr]:border-b [&_tr]:hover:bg-transparent"

/* Rows cascade in. The animation runs once per row element, so a row Vue keeps (a sort, an edit)
   doesn't replay; a row with a new key (a new page) does. The cascade scales with --kf-flourish. */
export const bodyClass = cn(
  "[&>tr]:animate-[kf-table-row_calc(380ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-spring)_backwards]",
  "[&>tr]:[animation-delay:calc(var(--kf-row,0)*28ms*var(--kf-speed,1)*var(--kf-flourish,1))]",
  "motion-reduce:[&>tr]:animate-none",
  "[&_tr:last-child]:border-0",
)

export const footerClass =
  "border-t border-[color:var(--table-border,var(--border))] bg-[var(--table-footer,color-mix(in_oklab,var(--muted)_40%,transparent))] font-medium [&>tr]:last:border-b-0 [&_tr]:hover:bg-transparent"

export const rowClass = cn(
  "transition-[background-color] duration-[calc(160ms*var(--kf-speed,1))] ease-house motion-reduce:transition-none",
  cn(
    "border-b border-[color:color-mix(in_oklab,var(--table-border,var(--border))_70%,transparent)] hover:bg-[color-mix(in_oklab,var(--table-accent,var(--foreground))_3%,transparent)]",
    "data-selected:bg-[color-mix(in_oklab,var(--table-accent,var(--foreground))_6%,transparent)]",
  ),
)

/* A sortable header's button fills the cell and lights up on hover. Numbers align right. */
export const headClass = cn(
  "h-9 px-[var(--table-padding,0.75rem)] text-left align-middle text-[12px] font-medium whitespace-nowrap text-[color:var(--table-muted,var(--muted-foreground))]",
  "[&:has([role=checkbox])]:w-px [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:flex",
  "data-sort:px-1.5",
  "[&_[data-slot=table-sort]]:inline-flex [&_[data-slot=table-sort]]:h-7 [&_[data-slot=table-sort]]:cursor-pointer [&_[data-slot=table-sort]]:items-center [&_[data-slot=table-sort]]:gap-1 [&_[data-slot=table-sort]]:rounded-[var(--table-radius,7px)] [&_[data-slot=table-sort]]:px-1.5 [&_[data-slot=table-sort]]:outline-none",
  "[&_[data-slot=table-sort]]:transition-[color,background-color] [&_[data-slot=table-sort]]:duration-[calc(150ms*var(--kf-speed,1))] [&_[data-slot=table-sort]]:hover:bg-accent [&_[data-slot=table-sort]]:hover:text-[color:var(--table-ink,var(--foreground))]",
  "[&_[data-slot=table-sort]]:focus-visible:ring-2 [&_[data-slot=table-sort]]:focus-visible:ring-ring",
  "data-[sort=ascending]:text-[color:var(--table-ink,var(--foreground))] data-[sort=descending]:text-[color:var(--table-ink,var(--foreground))]",
  "[&_[data-slot=table-sort-arrow]]:size-3.5",
)

export const arrowClass = cn(
  "transition-[rotate,opacity] duration-[calc(420ms*var(--kf-speed,1))] ease-spring motion-reduce:transition-none",
  "data-[sort=descending]:rotate-180 data-[sort=none]:opacity-0",
)

export const cellClass =
  "h-[var(--table-height,2.75rem)] px-[var(--table-padding,0.75rem)] align-middle whitespace-nowrap [&:has([role=checkbox])]:w-px [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:flex"

export const captionClass = "mt-3 text-[12px] text-[color:var(--table-muted,var(--muted-foreground))]"
