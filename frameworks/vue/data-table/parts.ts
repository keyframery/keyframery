/* The data table's primitive layer for Vue (src/components/primitives/data-table.tsx): the parts made from
   the core definition, the motion classes, the handle shared with the controls inside, and the column
   presence that lets a hidden column fold away before it leaves the page. */
import { createParts, type PrimitiveHandle } from "@ui-sdk/vue/primitive"
import { inject, type InjectionKey, onBeforeUnmount, ref, watch, type Ref } from "vue"

import { dataTable } from "@/components/keyframery/core/data-table-core"
import { cn } from "@/lib/utils"

/* The plain slots. The root (DataTableRoot) and the keyed head and row (DataTableHead, DataTableRow) are written
   by hand with usePrimitive + usePart, like React's: their `value` is the column's or row's own id. */
export const parts = createParts(dataTable, {
  toolbar: "div",
  search: "div",
  filters: "div",
  reset: "div",
  view: "div",
  content: "div",
  empty: "div",
  footer: "div",
  "bulk-bar": "div",
})

/* ---------------------------------------------------------------- motion */

/** For the table body: the cascade, with the direction from the content part's `data-direction`. */
export const dataTableBodyMotion = cn(
  "[&>tr]:animate-[kf-data-table-row_calc(420ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-spring)_backwards]",
  "[&>tr]:[animation-delay:calc(var(--kf-row,0)*30ms*var(--kf-speed,1)*var(--kf-flourish,1))]",
  "[[data-direction=backward]_&]:[--kf-dt-from:-8px]",
  "motion-reduce:[&>tr]:animate-none",
)

/** For every header and cell: a column that leaves folds to nothing; one that arrives opens out.
    Put the cell's content in an element with `data-data-table-cell` (the styled table does). */
export const dataTableCellMotion = cn(
  "transition-[padding] duration-[calc(320ms*var(--kf-speed,1))] ease-house motion-reduce:transition-none",
  "data-leaving:px-0! data-leaving:duration-[calc(240ms*var(--kf-speed,1))]",
  "[&>[data-data-table-cell]]:[interpolate-size:allow-keywords] [&>[data-data-table-cell]]:w-auto [&>[data-data-table-cell]]:overflow-hidden",
  "[&>[data-data-table-cell]]:transition-[width,opacity,filter] [&>[data-data-table-cell]]:duration-[calc(360ms*var(--kf-speed,1))] [&>[data-data-table-cell]]:ease-house",
  "[&>[data-data-table-cell]]:starting:w-0 [&>[data-data-table-cell]]:starting:opacity-0 [&>[data-data-table-cell]]:starting:blur-[calc(4px*var(--kf-flourish,1))]",
  "data-leaving:[&>[data-data-table-cell]]:w-0 data-leaving:[&>[data-data-table-cell]]:opacity-0 data-leaving:[&>[data-data-table-cell]]:blur-[calc(4px*var(--kf-flourish,1))] data-leaving:[&>[data-data-table-cell]]:duration-[calc(240ms*var(--kf-speed,1))]",
  "motion-reduce:[&>[data-data-table-cell]]:transition-none",
)

/** Reset: slides in from the start while anything is filtered and takes no room otherwise. */
export const resetMotion = cn(
  "grid grid-cols-[0fr] opacity-0 -translate-x-2 blur-[calc(3px*var(--kf-flourish,1))] data-shown:grid-cols-[1fr] data-shown:translate-x-0 data-shown:opacity-100 data-shown:blur-none",
  "transition-[grid-template-columns,opacity,translate,filter] duration-[calc(200ms*var(--kf-speed,1))] ease-house",
  "data-shown:duration-[calc(380ms*var(--kf-speed,1))] data-shown:ease-spring",
  "[&>*]:min-w-0 [&>*]:overflow-hidden data-shown:[&>*]:overflow-visible",
  "motion-reduce:transition-none",
)

/** The bulk bar: a room of its own while rows are selected, the bar rising from the bottom centre. */
export const bulkBarMotion = cn(
  "pointer-events-none sticky bottom-4 z-20 flex justify-center",
  "-mt-3 h-0 data-open:mt-0 data-open:h-[var(--data-table-bar-room,2.5rem)]",
  "transition-[height,margin-top] duration-[calc(240ms*var(--kf-speed,1))] ease-house data-open:duration-[calc(380ms*var(--kf-speed,1))]",
  "[&>*]:pointer-events-auto [&>*]:absolute [&>*]:bottom-0 [&>*]:origin-bottom",
  "[&>*]:transition-[opacity,translate,scale,filter]",
  "data-open:[&>*]:animate-[kf-data-table-rise_calc(460ms*var(--kf-speed,1))_var(--ease-spring)_backwards]",
  "data-closed:[&>*]:pointer-events-none data-closed:[&>*]:translate-y-[calc(8px+4px*var(--kf-flourish,1))] data-closed:[&>*]:scale-[0.96] data-closed:[&>*]:opacity-0 data-closed:[&>*]:blur-[calc(4px*var(--kf-flourish,1))]",
  "data-closed:[&>*]:duration-[calc(160ms*var(--kf-speed,1))] data-closed:[&>*]:ease-house",
  "motion-reduce:transition-none motion-reduce:[&>*]:animate-none motion-reduce:[&>*]:transition-none",
)

/* ---------------------------------------------------------------- the handle */

export const dataTableHandleKey: InjectionKey<PrimitiveHandle<typeof dataTable>> = Symbol("kf-data-table")

/** The api, for a control you compose inside: `useDataTable().setSearch("…")`. */
export function useDataTable() {
  const handle = inject(dataTableHandleKey, null)
  if (!handle) throw new Error("useDataTable must be used inside a DataTable")
  return handle.api
}

/* ---------------------------------------------------------------- column presence */

/* Each column that was just hidden stays for this long, folding, before it leaves the page. */
const LEAVE_MS = 260

/** The columns to draw: the visible ones, plus any that were just hidden and are still folding away
    (with `leaving`). Columns keep their definition order. Call it in setup with getters; bind `ref` to
    an element inside the table (for its speed). The watcher runs synchronously, so a hidden column
    never leaves the page for a frame before it folds. */
export function useColumnPresence<C extends { id: string }>(all: () => readonly C[], visible: () => readonly C[]) {
  const el: Ref<HTMLElement | null> = ref(null)
  const leaving = ref<string[]>([])
  let timer: ReturnType<typeof setTimeout> | undefined
  const schedule = () => {
    clearTimeout(timer)
    if (!leaving.value.length) return
    const node = el.value
    const speed = (node && parseFloat(getComputedStyle(node).getPropertyValue("--kf-speed"))) || 1
    const reduce = typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches
    const done = leaving.value
    timer = setTimeout(() => {
      leaving.value = leaving.value.filter((id) => !done.includes(id))
    }, reduce ? 0 : LEAVE_MS * speed)
  }
  watch(
    () => visible().map((c) => c.id).join("\u0000"),
    (ids, seen) => {
      const now = ids ? ids.split("\u0000") : []
      const gone = (seen ? seen.split("\u0000") : []).filter((id) => !now.includes(id))
      leaving.value = [...new Set([...leaving.value.filter((id) => !now.includes(id)), ...gone])]
      schedule()
    },
    { flush: "sync" },
  )
  onBeforeUnmount(() => clearTimeout(timer))
  const columns = () => {
    const shown = visible()
    return all()
      .filter((c) => shown.some((v) => v.id === c.id) || leaving.value.includes(c.id))
      .map((column) => ({ column, leaving: leaving.value.includes(column.id) }))
  }
  return { columns, ref: el }
}

/* ---------------------------------------------------------------- rendering a part as a component */

/** A part's `#render` props for a component whose root is a fragment (Keyframery's Button renders through
    <Speed>): its ref gets the component's first element, as React's `render={<Button />}` does. */
export function onElement(props: Record<string, any>) {
  const ref = props.ref
  if (typeof ref !== "function") return props
  const element = (value: any): Element | null => {
    if (!value) return null
    if (value instanceof Element) return value
    let node: Node | null = value.$el ?? null
    while (node && !(node instanceof Element)) node = node.nextSibling
    return node as Element | null
  }
  return { ...props, ref: (value: unknown, refs?: unknown) => ref(element(value), refs) }
}
