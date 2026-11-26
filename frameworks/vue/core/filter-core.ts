/* Faceted filters, as UI SDK primitives. UI SDK ships no filter, so these are defined with its core:
   the same definitions render in React, Vue, Svelte, Solid and web components.

   `filter` is one facet of a data table's toolbar: a chip named after a column ("Status") that opens
   a searchable list of that column's values, each with a count. It owns which values are chosen,
   whether its list is open and what is typed in its search. The list itself is UI SDK's combobox
   (multiple, with its input inside the popup), rendered by the adapter and controlled from this
   state: the combobox's `onValueChange`, `onOpenChange` and `onQueryChange` call `choose`,
   `setOpen` and `search` here. The value is always a list of strings; with `multiple: false`,
   choosing a value replaces the one before and closes the list.

   `filterBar` is the row that holds several filters. It counts the filters inside it that have
   something chosen, and its reset button clears them all (each filter hears a `filter-reset`
   event on its root and clears itself, so controlled and uncontrolled filters both work). */

import { type ChangeDetails, createChange, definePrimitive, dispatch } from "@ui-sdk/core"

/** One value a filter offers. */
type FilterOption = {
  /** What the filter's value holds when this option is chosen. */
  value: string
  /** What the option and its badge say. */
  label: string
  /** How many rows have this value. Shown at the option's end. */
  count?: number
  /** Can't be chosen. */
  disabled?: boolean
}

/** The value the "Clear filter" row of the list carries. The filter never stores it. */
const FILTER_CLEAR = "kf-filter-clear"

/* "clear-press", "reset-press" and "imperative" aren't in the shared vocabulary. The combobox's own
   reasons ("item-press", "chip-remove-press", "backspace-key", …) pass through as they are. */
type FilterValueChangeReason = "item-press" | "clear-press" | "reset-press" | "imperative" | (string & {})
type FilterOpenChangeReason = "trigger-press" | "item-press" | "escape-key" | "outside-press" | "focus-out" | "imperative" | (string & {})

type FilterOptions = {
  /** The column or facet the filter narrows, like "Status". Names the chip, its list and the filter for agents. */
  label?: string
  /** The values to choose from. */
  options?: readonly FilterOption[]
  /** The chosen values, controlled. */
  value?: string[]
  /** The chosen values at first, when uncontrolled. */
  defaultValue?: string[]
  /** Runs when the chosen values want to change. `details.cancel()` keeps them. */
  onValueChange?: (value: string[], details: ChangeDetails<FilterValueChangeReason>) => void
  /** Several values at once (the default), or one that replaces the last. */
  multiple?: boolean
  /** Whether the list is open, controlled. */
  open?: boolean
  /** Whether the list starts open, when uncontrolled. */
  defaultOpen?: boolean
  /** Runs when the list wants to open or close. */
  onOpenChange?: (open: boolean, details: ChangeDetails<FilterOpenChangeReason>) => void
}

type FilterState = {
  label: string
  options: readonly FilterOption[]
  value: string[]
  /** The chosen options' labels, in the options' order. */
  chosen: string[]
  multiple: boolean
  open: boolean
  query: string
}

const labelsOf = (options: readonly FilterOption[], value: readonly string[]) =>
  options.filter((option) => value.includes(option.value)).map((option) => option.label)

/* Chosen values in the options' order, so badges don't reorder as people pick. Values the options
   don't know (yet) stay at the end. */
const ordered = (options: readonly FilterOption[], value: readonly string[]) => [
  ...options.filter((option) => value.includes(option.value)).map((option) => option.value),
  ...value.filter((entry) => !options.some((option) => option.value === entry)),
]

const filter = definePrimitive({
  name: "filter",
  options: {
    label: "string",
    options: "value",
    value: "list",
    defaultValue: "list",
    onValueChange: "callback",
    multiple: "boolean",
    open: "boolean",
    defaultOpen: "boolean",
    onOpenChange: "callback",
  },
  state: (options: FilterOptions): FilterState => {
    const value = options.value ?? options.defaultValue ?? []
    const list = options.options ?? []
    return {
      label: options.label ?? "Filter",
      options: list,
      value,
      chosen: labelsOf(list, value),
      multiple: options.multiple ?? true,
      open: options.open ?? options.defaultOpen ?? false,
      query: "",
    }
  },
  sync: (options) => ({
    label: options.label ?? "Filter",
    options: options.options ?? [],
    multiple: options.multiple ?? true,
    ...(options.value === undefined ? {} : { value: options.value }),
    ...(options.open === undefined ? {} : { open: options.open }),
  }),
  controlled: ["value", "open", "chosen"],
  api: (context) => {
    const { store } = context
    const change = createChange(context)

    /* `chosen` follows the value and the options, however either changes. */
    let from = { options: store.get().options, value: store.get().value }
    context.onDestroy(
      store.subscribe(() => {
        const { options, value } = store.get()
        if (options === from.options && value === from.value) return
        from = { options, value }
        store.set({ chosen: labelsOf(options, value) })
      }),
    )

    /* A value or a label, matched without regard to case, as an agent or a person might name it. */
    const resolve = (name: string) => {
      const options = store.get().options
      const exact = options.find((option) => option.value === name)
      if (exact) return exact.value
      const lower = name.trim().toLowerCase()
      return options.find((option) => option.label.toLowerCase() === lower || option.value.toLowerCase() === lower)?.value ?? name
    }

    const write = (next: string[], reason: FilterValueChangeReason, event?: Event) => {
      const value = ordered(store.get().options, next)
      const now = store.get().value
      if (value.length === now.length && value.every((entry, index) => entry === now[index])) return false
      return change("value", value, { reason, event })
    }

    const api = {
      /** Chooses exactly these values (by value or label). With `multiple: false`, only the first counts. */
      setValue(value: string[] | string, event?: Event) {
        const list = (Array.isArray(value) ? value : [value]).map(resolve)
        return write(store.get().multiple ? list : list.slice(0, 1), "imperative", event)
      },
      /** Adds a value if it isn't chosen, removes it if it is. */
      toggle(value: string, event?: Event) {
        const key = resolve(value)
        const now = store.get().value
        if (now.includes(key)) return write(now.filter((entry) => entry !== key), "imperative", event)
        return write(store.get().multiple ? [...now, key] : [key], "imperative", event)
      },
      /** Removes every chosen value. */
      clear(event?: Event, reason: FilterValueChangeReason = "clear-press") {
        return write([], reason, event)
      },
      /** What the combobox inside wants the value to be: a toggle, the clear row, or Backspace. */
      choose(next: readonly string[], details: { reason: string; event?: Event }) {
        const { value: now, multiple } = store.get()
        if (next.includes(FILTER_CLEAR)) {
          api.clear(details.event)
          return
        }
        if (multiple) {
          write([...next], details.reason, details.event)
          return
        }
        const added = next.find((entry) => !now.includes(entry))
        write(added ? [added] : [...next].slice(-1).filter((entry) => !now.includes(entry)), details.reason, details.event)
        if (added) api.setOpen(false, { reason: "item-press", event: details.event })
      },
      /** Opens or closes the list. Opening starts the search over. */
      setOpen(open: boolean, details: { reason?: FilterOpenChangeReason; event?: Event } = {}) {
        if (open === store.get().open) return true
        const done = change("open", open, { reason: details.reason ?? "imperative", event: details.event })
        if (done && open) store.set({ query: "" })
        return done
      },
      /** What is typed in the list's search field. */
      search(query: string) {
        if (query !== store.get().query) store.set({ query })
      },
      /** The options, for agents to choose from. */
      items() {
        return store.get().options.map((option) => ({ value: option.value, label: option.label }))
      },
    }
    return api
  },
  slots: (slot) => ({
    /* Wraps the chip and its list. Named after the facet, so the filter reads as "Status". */
    root: slot<{}, { value: string[]; chosen: string[]; open: boolean; query: string; active: boolean }>({
      role: "group",
      state: (state) => ({ value: state.value, chosen: state.chosen, open: state.open, query: state.query, active: state.value.length > 0 }),
      attrs: (state) => ({
        "aria-label": state.label,
        "data-active": state.value.length > 0 ? "" : undefined,
        "data-open": state.open ? "" : undefined,
        "data-count": String(state.value.length),
      }),
      bind: (el, part) => {
        const reset = (event: Event) => part.api.clear(event, "reset-press")
        el.addEventListener("filter-reset", reset)
        return () => el.removeEventListener("filter-reset", reset)
      },
    }),
  }),
  agent: { actions: ["setValue", "toggle", "clear"], items: (api) => api.items() },
})

type FilterValuesOptions = {
  /** The chosen values. */
  value?: string[]
  /** Their labels, in the same order. */
  chosen?: string[]
}

/* The chosen values inside the chip, as a primitive of their own: the chip belongs to the combobox
   (which the filter hides from agents, since the filter already offers everything it does), so its
   contents can't be parts of the filter without hiding the filter too. Its width follows what it
   holds (`--filter-values-width`, measured from its first child), so the chip can widen and narrow
   smoothly. Decorative: the chip's accessible name carries the chosen labels as text. */
const filterValues = definePrimitive({
  name: "filter-values",
  options: { value: "list", chosen: "list" },
  state: (options: FilterValuesOptions) => ({ value: options.value ?? [], chosen: options.chosen ?? [] }),
  sync: (options) => ({ value: options.value ?? [], chosen: options.chosen ?? [] }),
  controlled: [],
  api: () => ({}),
  slots: (slot) => ({
    root: slot<{}, { value: string[]; chosen: string[]; count: number; summary: string }>({
      state: (state) => ({
        value: state.value,
        chosen: state.chosen,
        count: state.value.length,
        summary: state.chosen.length ? `, ${state.chosen.length} selected: ${state.chosen.join(", ")}` : "",
      }),
      attrs: (state) => ({
        "data-empty": state.value.length ? undefined : "",
        "data-count": String(state.value.length),
      }),
      bind: (el) => {
        const measure = () => {
          const inner = el.querySelector<HTMLElement>("[data-filter-values-row]")
          el.style.setProperty("--filter-values-width", `${inner ? inner.offsetWidth : 0}px`)
        }
        const resize = new ResizeObserver(measure)
        const watch = () => {
          resize.disconnect()
          const inner = el.querySelector("[data-filter-values-row]")
          if (inner) resize.observe(inner)
          measure()
        }
        watch()
        const children = new MutationObserver(watch)
        children.observe(el, { childList: true })
        return () => {
          resize.disconnect()
          children.disconnect()
        }
      },
    }),
  }),
  agent: { actions: [] },
})

type FilterBarOptions = {
  /** Runs when the reset button is pressed, before the filters inside clear themselves. `details.cancel()` stops it. */
  onReset?: (value: null, details: ChangeDetails<"reset-press" | "imperative">) => void
}

type FilterBarState = {
  /** How many filters inside have something chosen. */
  active: number
}

const filterBar = definePrimitive({
  name: "filter-bar",
  options: { onReset: "callback" },
  state: (_options: FilterBarOptions): FilterBarState => ({ active: 0 }),
  controlled: ["active"],
  api: (context) => {
    let root: HTMLElement | undefined
    return {
      /** @internal Where the filters are. */
      attach(el: HTMLElement) {
        root = el
        const count = () => {
          const active = el.querySelectorAll('[data-slot="filter"][data-active]').length
          if (active !== context.store.get().active) context.store.set({ active })
        }
        count()
        const observer = new MutationObserver(count)
        observer.observe(el, { subtree: true, childList: true, attributes: true, attributeFilter: ["data-active"] })
        return () => {
          observer.disconnect()
          root = undefined
        }
      },
      /** Clears every filter in the bar. */
      reset(event?: Event) {
        if (!root || !context.store.get().active) return false
        if (dispatch(context, "onReset", null, { reason: event ? "reset-press" : "imperative", event })) return false
        for (const el of root.querySelectorAll('[data-slot="filter"][data-active]')) el.dispatchEvent(new CustomEvent("filter-reset"))
        return true
      },
    }
  },
  slots: (slot) => ({
    root: slot<{}, { active: number }>({
      role: "group",
      state: (state) => ({ active: state.active }),
      attrs: (state) => ({ "data-active": state.active ? "" : undefined, "data-count": String(state.active) }),
      bind: (el, part) => part.api.attach(el),
    }),
    /* Stays in the page so it can slide out; while nothing is chosen it is inert and hidden. */
    reset: slot<{}, { active: number }>({
      role: "button",
      focus: "native",
      state: (state) => ({ active: state.active }),
      attrs: (state) => ({
        type: "button",
        "data-hidden": state.active ? undefined : "",
        "aria-hidden": state.active ? undefined : "true",
        inert: state.active ? undefined : "",
      }),
      press: ({ api }, event) => api.reset(event),
    }),
  }),
  agent: { actions: ["reset"] },
})

export { FILTER_CLEAR, filter, filterBar, filterValues, type FilterBarOptions, type FilterOption, type FilterOptions, type FilterState }
