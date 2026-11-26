/* Layout helpers shared by the header and the cells (src/components/ui/data-table.tsx). */
import { cn } from "@/lib/utils"

import type { DataTableColumnDef } from "./types"

const hideBelow = {
  sm: "@max-[30rem]/data-table:hidden",
  md: "@max-[40rem]/data-table:hidden",
  lg: "@max-[52rem]/data-table:hidden",
} as const

const alignment = { start: "text-start", center: "text-center", end: "text-end" } as const

/* A sticky cell takes the card's surface, tinted like its row, so the rows slide under it. */
export const stickyCell = cn(
  "@max-[40rem]/data-table:sticky @max-[40rem]/data-table:z-[1] @max-[40rem]/data-table:bg-[var(--data-table-surface,var(--card))]",
  /* Once the rows scroll under it, the last sticky cell gets a hairline edge. */
  "@max-[40rem]/data-table:[[data-scroll-start]_&[data-sticky-edge]]:shadow-[inset_-1px_0_0_var(--border)]",
  /* The row's own translucent tint, layered over the surface, so a sticky cell matches its row exactly. */
  "@max-[40rem]/data-table:[tr:hover>&]:bg-[linear-gradient(color-mix(in_oklab,var(--data-table-accent,var(--foreground))_3%,transparent),color-mix(in_oklab,var(--data-table-accent,var(--foreground))_3%,transparent))]",
  "@max-[40rem]/data-table:[tr[data-selected]>&]:bg-[linear-gradient(color-mix(in_oklab,var(--data-table-accent,var(--foreground))_6%,transparent),color-mix(in_oklab,var(--data-table-accent,var(--foreground))_6%,transparent))]",
)

export function columnClass(column: DataTableColumnDef<any>, selectable: boolean) {
  return cn(
    alignment[column.align ?? "start"],
    column.hideBelow && hideBelow[column.hideBelow],
    column.sticky && [stickyCell, selectable ? "@max-[40rem]/data-table:left-10" : "@max-[40rem]/data-table:left-0"],
    column.class,
  )
}
