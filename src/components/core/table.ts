/* A table, as UI SDK primitives. UI SDK ships no table, so it is defined with its core: the same
   definitions render in React, Vue, Svelte, Solid and web components.

   `table` is the table and its parts: a scrolling container that knows which sides it can still
   scroll toward, and rows that can be selected. `tableHead` is one column header, which becomes a
   sort button when it is sortable: pressing it turns the sort over, and the header reports it with
   `aria-sort`. Each header is its own instance, so a sortable header keeps its own sort. */

import { type ChangeDetails, createChange, definePrimitive, dispatch } from "@ui-sdk/core"

/** How a column is sorted, with the values `aria-sort` takes. */
type SortDirection = "ascending" | "descending" | "none"

type TableState = {
  /** The container can scroll back toward the start. */
  scrollStart: boolean
  /** The container can scroll on toward the end. */
  scrollEnd: boolean
}

const table = definePrimitive({
  name: "table",
  state: (): TableState => ({ scrollStart: false, scrollEnd: false }),
  api: (context) => ({
    /** Reads how far the container is scrolled and marks the sides it can still scroll toward. */
    measure(el: HTMLElement) {
      const max = el.scrollWidth - el.clientWidth
      /* Right to left, scrollLeft runs from 0 down to -max, so its size is the distance from the start. */
      const at = Math.abs(el.scrollLeft)
      const next = { scrollStart: at > 1, scrollEnd: max - at > 1 }
      const now = context.store.get()
      if (next.scrollStart !== now.scrollStart || next.scrollEnd !== now.scrollEnd) context.store.set(next)
    },
  }),
  slots: (slot) => ({
    /* Scrolls sideways when the table is wider than the space it has. */
    container: slot<{}, TableState>({
      state: (state) => ({ scrollStart: state.scrollStart, scrollEnd: state.scrollEnd }),
      attrs: (state) => ({
        "data-scroll-start": state.scrollStart ? "" : undefined,
        "data-scroll-end": state.scrollEnd ? "" : undefined,
      }),
      bind: (el, part) => {
        const measure = () => part.api.measure(el)
        measure()
        const resize = new ResizeObserver(measure)
        resize.observe(el)
        if (el.firstElementChild) resize.observe(el.firstElementChild)
        el.addEventListener("scroll", measure, { passive: true })
        return () => {
          resize.disconnect()
          el.removeEventListener("scroll", measure)
        }
      },
    }),
    root: slot({}),
    header: slot({}),
    body: slot({}),
    footer: slot({}),
    row: slot<{ selected?: boolean }, { selected: boolean }>({
      props: { selected: "boolean" },
      state: (_state, part) => ({ selected: part.props.selected ?? false }),
      attrs: (_state, part) => ({
        "data-selected": part.props.selected ? "" : undefined,
        "aria-selected": part.props.selected === undefined ? undefined : String(part.props.selected),
      }),
    }),
    cell: slot({}),
    caption: slot({}),
  }),
  /* A table only shows data. What an agent can do with it is on its sortable headers. */
  agent: { actions: [], shown: () => false },
})

type TableHeadOptions = {
  /** How this column is sorted, controlled. Pass `onSort` or `onSortChange` with it. */
  sort?: SortDirection
  /** How this column is sorted at first, when you don't control `sort`. Makes the header sortable. */
  defaultSort?: SortDirection
  /** Runs when the sort changes, with the next direction. */
  onSortChange?: (sort: SortDirection, details: ChangeDetails<"press">) => void
  /** Runs when the header is pressed, with the direction it turns to. Flip `sort` here. Makes the header sortable. */
  onSort?: (sort: SortDirection, details: ChangeDetails<"press">) => void
}

type TableHeadState = {
  sort: SortDirection
  /** The header is a sort button: it has `onSort`, `onSortChange` or `defaultSort`. */
  sortable: boolean
}

const isSortable = (options: TableHeadOptions) =>
  options.onSort !== undefined || options.onSortChange !== undefined || options.defaultSort !== undefined

/* Its parts are the table's own (`table-head`, `table-sort`, `table-sort-arrow`), so the name is
   the table's; `label` names the header in warnings and the devtools. */
const tableHead = definePrimitive({
  name: "table",
  label: "table-head",
  options: { sort: "string", defaultSort: "string", onSortChange: "callback", onSort: "callback" },
  controlled: ["sort"],
  state: (options: TableHeadOptions): TableHeadState => ({
    sort: options.sort ?? options.defaultSort ?? "none",
    sortable: isSortable(options),
  }),
  sync: (options) => ({ ...(options.sort === undefined ? {} : { sort: options.sort }), sortable: isSortable(options) }),
  api: (context) => {
    const change = createChange(context)
    return {
      /** Turns the sort over: ascending becomes descending, anything else ascending. */
      toggleSort(event?: Event) {
        const { sort, sortable } = context.store.get()
        if (!sortable) return false
        const next: SortDirection = sort === "ascending" ? "descending" : "ascending"
        if (dispatch(context, "onSort", next, { reason: "press", event })) return false
        return change("sort", next, { reason: "press", event })
      },
    }
  },
  slots: (slot) => ({
    head: slot<{}, TableHeadState>({
      state: (state) => ({ sort: state.sort, sortable: state.sortable }),
      attrs: (state) => ({
        "aria-sort": state.sortable ? state.sort : undefined,
        "data-sort": state.sortable ? state.sort : undefined,
      }),
    }),
    /* The whole label is the button, so it is easy to hit. */
    sort: slot<{}, { sort: SortDirection }>({
      present: (state) => state.sortable,
      state: (state) => ({ sort: state.sort }),
      attrs: (state) => ({ type: "button", "data-sort": state.sort }),
      press: ({ api }, event) => api.toggleSort(event),
    }),
    "sort-arrow": slot<{}, { sort: SortDirection }>({
      present: (state) => state.sortable,
      state: (state) => ({ sort: state.sort }),
      attrs: (state) => ({ "aria-hidden": "true", "data-sort": state.sort }),
    }),
  }),
  agent: { actions: ["toggleSort"], shown: (state) => state.sortable },
})

export { type SortDirection, table, tableHead, type TableHeadOptions, type TableHeadState, type TableState }
