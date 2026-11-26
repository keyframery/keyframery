"use client"

/* Animated faceted filter, on UI SDK's core. UI SDK ships no filter, so its state is defined in
   `@/components/core/filter` with `definePrimitive`, and its list is UI SDK's combobox (multiple,
   with the search field inside the popup), controlled from that state. This file adds motion only.
   Colours, radii, shadows and spacing stay yours.

   - Unfold: the list grows out of its chip (the combobox's own motion), its rows Cascade in and one
     highlight Glides between them.
   - Widen: the chosen values sit in a box whose width follows what it holds on a spring, so the chip
     widens and narrows around new badges without stretching its text.
   - Cascade: badges arrive one after another, each popping in from a smaller, blurred start. The
     stagger, blur and all but a 0.95 scale scale with --kf-flourish.
   - Roll: "3 selected" and the option counts are rolling digits (use `Roll` from the badge).
   - The bar's reset button slides in from the left while any filter is active, and out again. */

import type { StateOf } from "@ui-sdk/core"
import { createParts, type PartProps, usePart, usePrimitive, type PrimitiveHandle } from "@ui-sdk/react/primitive"
import * as React from "react"

import { FILTER_CLEAR, filter, filterBar, type FilterOptions, type FilterState, filterValues } from "@/components/core/filter"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxList,
  type ComboboxProps,
  ComboboxSeparator,
  ComboboxTrigger,
} from "@/components/primitives/combobox"
import { cn } from "@/lib/utils"

/* UI SDK parts take a class name or a function of the part's state. Keep both working. */
function withClass<S>(base: string, className: string | ((state: S) => string | undefined) | undefined) {
  return typeof className === "function" ? (state: S) => cn(base, className(state)) : cn(base, className)
}

/* The instance, and the chip the list opens from, shared with the parts inside (the content renders
   in a portal, so it anchors to the chip through this). */
type FilterContextValue = {
  handle: PrimitiveHandle<typeof filter>
  anchor: HTMLElement | null
  setAnchor: (el: HTMLElement | null) => void
}
const FilterContext = React.createContext<FilterContextValue | null>(null)

function useFilter(part: string) {
  const context = React.use(FilterContext)
  if (!context) throw new Error(`${part} must be inside a Filter.`)
  return context
}

type FilterProps = FilterOptions &
  Omit<PartProps<"div", StateOf<typeof filter, "root">>, "defaultValue"> & {
    /** Passed to the combobox inside, like `loop` or `autoHighlight`. */
    comboboxProps?: Omit<ComboboxProps<string, true>, "value" | "defaultValue" | "onValueChange" | "open" | "onOpenChange" | "query" | "onQueryChange" | "multiple">
  }

/* The filter: its root and the combobox it controls. Put a `FilterTrigger` and a `FilterContent` inside. */
function Filter({
  label,
  options,
  value,
  defaultValue,
  onValueChange,
  multiple,
  open,
  defaultOpen,
  onOpenChange,
  comboboxProps,
  children,
  ...props
}: FilterProps) {
  const handle = usePrimitive(filter, { label, options, value, defaultValue, onValueChange, multiple, open, defaultOpen, onOpenChange })
  const [anchor, setAnchor] = React.useState<HTMLElement | null>(null)
  const labelOf = React.useCallback(
    (entry: string) => handle.state.options.find((option) => option.value === entry)?.label ?? entry,
    [handle],
  )
  const root = usePart(
    handle,
    "root",
    {},
    {
      ...props,
      children: (state) => (
        <Combobox<string, true>
          multiple
          loop
          autoHighlight
          itemToLabel={labelOf}
          {...comboboxProps}
          value={state.value}
          onValueChange={(next, details) => handle.api.choose(next, details)}
          open={state.open}
          onOpenChange={(next, details) => handle.api.setOpen(next, details)}
          query={state.query}
          onQueryChange={(next) => handle.api.search(next)}
          onOpenChangeComplete={(isOpen) => {
            comboboxProps?.onOpenChangeComplete?.(isOpen)
            /* Back to the chip, unless focus already went somewhere else on purpose. */
            const active = document.activeElement
            if (!isOpen && (!active || active === document.body)) anchor?.focus()
          }}
        >
          {typeof children === "function" ? children(state) : children}
        </Combobox>
      ),
    },
    "div",
  )
  return <FilterContext value={{ handle, anchor, setAnchor }}>{root}</FilterContext>
}

const press = "transition-[scale,background-color,box-shadow,color] duration-[calc(200ms*var(--kf-speed,1))] ease-pop active:scale-[calc(1-0.04*var(--kf-flourish,1))] motion-reduce:transition-none!"

/* The chip. A button that opens the list. */
function FilterTrigger({ className, ...props }: React.ComponentProps<typeof ComboboxTrigger>) {
  const { setAnchor } = useFilter("FilterTrigger")
  /* The filter around it is what agents use (`setValue`, `toggle`, `clear`); the combobox inside
     would only repeat it under the same name. */
  return <ComboboxTrigger ref={setAnchor} data-agent-hidden="" className={withClass(press, className)} {...props} />
}

/* The filter's state, kept current in parts the root's render doesn't reach (children passed in
   once, like the chip's contents). */
function useFilterState(part: string) {
  const { instance } = useFilter(part).handle
  return React.useSyncExternalStore(
    instance.subscribe,
    () => instance.get() as FilterState,
    () => instance.get() as FilterState,
  )
}

/* The chosen values inside the chip. Its children (a function of the chosen values) are laid in a
   row whose width the box follows on a spring; each child pops in, one after another. A visually
   hidden summary (", 2 selected: Paid, Pending") gives the chip's accessible name the same news. */
function FilterValues({
  className,
  innerClassName,
  children,
  ...props
}: PartProps<"span", StateOf<typeof filterValues, "root">> & {
  /** Classes for the row inside, which is measured. */
  innerClassName?: string
}) {
  const { value, chosen } = useFilterState("FilterValues")
  const handle = usePrimitive(filterValues, { value, chosen })
  return usePart(
    handle,
    "root",
    {},
    {
      ...props,
      className: withClass(
        cn(
          "relative inline-flex shrink-0 overflow-hidden w-(--filter-values-width,auto)",
          "transition-[width,opacity] duration-[calc(460ms*var(--kf-speed,1))] ease-spring data-empty:opacity-0 data-empty:duration-[calc(260ms*var(--kf-speed,1))] data-empty:ease-house",
          "motion-reduce:transition-none!",
        ),
        className,
      ),
      children: (state) => (
        <>
          <span className="sr-only">{state.summary}</span>
          <span
            data-filter-values-row=""
            aria-hidden="true"
            className={cn(
              "inline-flex w-max shrink-0 items-center",
              "[&>*]:transition-[opacity,scale,filter] [&>*]:duration-[calc(420ms*var(--kf-speed,1))] [&>*]:ease-pop",
              "[&>*]:starting:scale-[calc(0.95-0.35*var(--kf-flourish,1))] [&>*]:starting:opacity-0 [&>*]:starting:blur-[calc(3px*var(--kf-flourish,1))]",
              "[&>*]:[transition-delay:calc((min(sibling-index(),6)-1)*calc(70ms*var(--kf-speed,1))*var(--kf-flourish,1))]",
              "motion-reduce:[&>*]:transition-none!",
              innerClassName,
            )}
          >
            {typeof children === "function" ? children(state) : children}
          </span>
        </>
      ),
    },
    "span",
  )
}

/* The popup, anchored to the chip, so it unfolds out of it. */
function FilterContent({ align = "start", ...props }: React.ComponentProps<typeof ComboboxContent>) {
  const { anchor } = useFilter("FilterContent")
  return <ComboboxContent anchor={anchor} align={align} {...props} />
}

/* The search field at the top of the list. Takes focus when the list opens. */
function FilterInput({ autoFocus = true, ...props }: React.ComponentProps<typeof ComboboxInput>) {
  const { handle } = useFilter("FilterInput")
  return <ComboboxInput autoFocus={autoFocus} aria-label={props["aria-label"] ?? `Search ${handle.state.label}`} {...props} />
}

const FilterList = ComboboxList
const FilterEmpty = ComboboxEmpty
const FilterSeparator = ComboboxSeparator
const FilterOptionIndicator = ComboboxItemIndicator

/* One value to choose: a combobox item, keyed by its value. */
function FilterOption(props: React.ComponentProps<typeof ComboboxItem<string>>) {
  return <ComboboxItem<string> {...props} />
}

/* The "Clear filter" row at the foot of the list. Only there while something is chosen; choosing it
   clears the filter. */
function FilterClear({ children, ...props }: Omit<React.ComponentProps<typeof ComboboxItem<string>>, "value">) {
  const { value } = useFilterState("FilterClear")
  if (!value.length) return null
  return (
    <ComboboxItem<string> value={FILTER_CLEAR} label="Clear filter" {...props}>
      {children ?? "Clear filter"}
    </ComboboxItem>
  )
}

const { Root: FilterBarRoot, Reset: FilterBarResetPart } = createParts(filterBar, { root: "div", reset: "button" })

/* The row of filters. Marks `data-active` while any filter inside has a value. */
function FilterBar(props: React.ComponentProps<typeof FilterBarRoot>) {
  return <FilterBarRoot aria-label="Filters" {...props} />
}

/* Clears every filter in the bar. Slides in from the left while one is active, and out again. */
function FilterBarReset({ className, ...props }: React.ComponentProps<typeof FilterBarResetPart>) {
  return (
    <FilterBarResetPart
      className={withClass(
        cn(
          press,
          "transition-[opacity,translate,filter,scale,background-color,color] duration-[calc(420ms*var(--kf-speed,1))] ease-spring",
          "data-hidden:pointer-events-none data-hidden:-translate-x-2 data-hidden:opacity-0 data-hidden:blur-[calc(3px*var(--kf-flourish,1))] data-hidden:duration-[calc(180ms*var(--kf-speed,1))] data-hidden:ease-house",
        ),
        className,
      )}
      {...props}
    />
  )
}

export {
  FILTER_CLEAR,
  Filter,
  FilterBar,
  FilterBarReset,
  FilterClear,
  FilterContent,
  FilterEmpty,
  FilterInput,
  FilterList,
  FilterOption,
  FilterOptionIndicator,
  FilterSeparator,
  FilterTrigger,
  FilterValues,
}
export type { FilterOption as FilterOptionData, FilterOptions } from "@/components/core/filter"
