/* The filter's primitive layer for Vue (src/components/primitives/filter.tsx): the instance from the core
   definition, the combobox it controls, the chosen-values box and the bar. Motion classes live in the SFCs. */
import type { ChangeDetails } from "@ui-sdk/core"
import { Combobox } from "@ui-sdk/vue/combobox"
import { createParts, usePart, usePrimitive, type PrimitiveHandle } from "@ui-sdk/vue/primitive"
import { computed, defineComponent, h, inject, provide, shallowRef, type InjectionKey, type PropType, type ShallowRef } from "vue"

import { filter, filterBar, type FilterOption, type FilterState, filterValues } from "@/components/keyframery/core/filter-core"
import { cn } from "@/lib/utils"

type FilterContext = {
  handle: PrimitiveHandle<typeof filter>
  /** The chip the list opens from (the content anchors to it). */
  anchor: ShallowRef<HTMLElement | null>
}
export const filterKey: InjectionKey<FilterContext> = Symbol("kf-filter")

export function useFilter(part: string) {
  const context = inject(filterKey, null)
  if (!context) throw new Error(`${part} must be inside a Filter.`)
  return context
}

/* The filter's state, tracked in a render or computed. */
export function useFilterState(part: string) {
  const { handle } = useFilter(part)
  return computed(() => handle.state as FilterState)
}

const optionalBoolean = { type: Boolean, default: undefined }

/* The filter: its root and the combobox it controls. Put a FilterTrigger and a FilterContent inside. */
export const FilterRoot = defineComponent({
  name: "FilterRoot",
  inheritAttrs: false,
  props: {
    label: String,
    options: Array as PropType<readonly FilterOption[]>,
    value: Array as PropType<string[]>,
    defaultValue: Array as PropType<string[]>,
    multiple: optionalBoolean,
    open: optionalBoolean,
    defaultOpen: optionalBoolean,
    /** Passed to the combobox inside, like `loop` or `autoHighlight`. */
    comboboxProps: Object as PropType<Record<string, unknown>>,
  },
  emits: ["value-change", "update:value", "open-change", "update:open"],
  setup(props, { slots, emit }) {
    const handle = usePrimitive(filter, () => ({
      label: props.label,
      options: props.options,
      value: props.value,
      defaultValue: props.defaultValue,
      multiple: props.multiple,
      open: props.open,
      defaultOpen: props.defaultOpen,
      onValueChange(value: string[], details: ChangeDetails<string>) {
        emit("value-change", value, details)
        if (!details.canceled) emit("update:value", value)
      },
      onOpenChange(open: boolean, details: ChangeDetails<string>) {
        emit("open-change", open, details)
        if (!details.canceled) emit("update:open", open)
      },
    }))
    const anchor = shallowRef<HTMLElement | null>(null)
    provide(filterKey, { handle, anchor })
    const labelOf = (entry: string) => handle.state.options.find((option) => option.value === entry)?.label ?? entry
    return usePart(handle, "root", undefined, undefined, {
      tag: "div",
      children: (state) =>
        h(
          Combobox as any,
          {
            multiple: true,
            loop: true,
            autoHighlight: true,
            itemToLabel: labelOf,
            ...props.comboboxProps,
            value: state.value,
            onValueChange: (next: string[], details: { reason: string; event?: Event }) => handle.api.choose(next, details),
            open: state.open,
            onOpenChange: (next: boolean, details: { reason?: string; event?: Event }) => handle.api.setOpen(next, details),
            query: state.query,
            onQueryChange: (next: string) => handle.api.search(next),
            onOpenChangeComplete: (isOpen: boolean) => {
              ;(props.comboboxProps?.onOpenChangeComplete as ((open: boolean) => void) | undefined)?.(isOpen)
              /* Back to the chip, unless focus already went somewhere else on purpose. */
              const active = document.activeElement
              if (!isOpen && (!active || active === document.body)) anchor.value?.focus()
            },
          },
          { default: () => slots.default?.({ state }) },
        ),
    })
  },
})

/* The chosen values inside the chip: a row (measured) whose width the box follows on a spring. A visually
   hidden summary gives the chip's accessible name the same news. */
export const FilterValuesRoot = defineComponent({
  name: "FilterValuesRoot",
  inheritAttrs: false,
  props: {
    /** Classes for the row inside, which is measured. */
    innerClass: String,
  },
  setup(props, { slots }) {
    const state = useFilterState("FilterValues")
    const handle = usePrimitive(filterValues, () => ({ value: state.value.value, chosen: state.value.chosen }))
    return usePart(handle, "root", undefined, undefined, {
      tag: "span",
      children: (values) => [
        h("span", { class: "sr-only" }, values.summary),
        h(
          "span",
          {
            "data-filter-values-row": "",
            "aria-hidden": "true",
            class: cn(
              "inline-flex w-max shrink-0 items-center",
              "[&>*]:transition-[opacity,scale,filter] [&>*]:duration-[calc(420ms*var(--kf-speed,1))] [&>*]:ease-pop",
              "[&>*]:starting:scale-[calc(0.95-0.35*var(--kf-flourish,1))] [&>*]:starting:opacity-0 [&>*]:starting:blur-[calc(3px*var(--kf-flourish,1))]",
              "[&>*]:[transition-delay:calc((min(sibling-index(),6)-1)*calc(70ms*var(--kf-speed,1))*var(--kf-flourish,1))]",
              "motion-reduce:[&>*]:transition-none!",
              props.innerClass,
            ),
          },
          slots.default?.({ state: values }),
        ),
      ],
    })
  },
})

export const filterBarParts = createParts(filterBar, { root: "div", reset: "button" })

/* Every chip and its contents share one press. */
export const press =
  "transition-[scale,background-color,box-shadow,color] duration-[calc(200ms*var(--kf-speed,1))] ease-pop active:scale-[calc(1-0.04*var(--kf-flourish,1))] motion-reduce:transition-none!"

/* The combobox primitive's motion (src/components/primitives/combobox.tsx), for the parts the filter renders. */
export const comboboxPress =
  "transition-[scale,color,background-color,opacity] duration-[calc(200ms*var(--kf-speed,1))] ease-pop active:scale-[calc(1-0.1*var(--kf-flourish,1))] motion-reduce:transition-none!"
export const comboboxRow = cn(
  "transition-[opacity,translate,filter] duration-[calc(420ms*var(--kf-speed,1)*var(--kf-flourish,1))] ease-spring [transition-delay:calc((min(sibling-index(),10)-1)*calc(32ms*var(--kf-speed,1))*var(--kf-flourish,1))]",
  "group-data-starting-style/kf-content:translate-y-2 group-data-starting-style/kf-content:opacity-0 group-data-starting-style/kf-content:blur-[4px]",
  "group-data-ending-style/kf-content:[transition-delay:0ms]",
  "group-data-starting-style/kf-content:transition-none",
  "data-highlighted:[anchor-name:--kf-hl]",
  "motion-reduce:transition-none!",
)
export const comboboxTrigger = cn(
  comboboxPress,
  "[&_svg]:transition-[rotate] [&_svg]:duration-[calc(420ms*var(--kf-speed,1))] [&_svg]:ease-spring data-open:[&_svg]:rotate-180 motion-reduce:[&_svg]:transition-none",
)
export const comboboxContent = cn(
  "group/kf-content origin-(--transform-origin) transition-[opacity,scale,translate,filter] duration-[calc(380ms*var(--kf-speed,1))] ease-spring",
  "data-starting-style:scale-[calc(0.95-0.09*var(--kf-flourish,1))] data-starting-style:opacity-0 data-starting-style:blur-[calc(6px*var(--kf-flourish,1))]",
  "data-[side=bottom]:data-starting-style:-translate-y-2 data-[side=top]:data-starting-style:translate-y-2",
  "data-[side=left]:data-starting-style:translate-x-2 data-[side=right]:data-starting-style:-translate-x-2",
  "data-[presentation=sheet]:data-starting-style:scale-100 data-[presentation=sheet]:data-starting-style:blur-none data-[presentation=sheet]:data-starting-style:translate-none data-[presentation=sheet]:data-ending-style:scale-100 data-[presentation=sheet]:data-ending-style:blur-none data-[presentation=sheet]:data-ending-style:translate-none",
  "data-ending-style:scale-[0.96] data-ending-style:opacity-0 data-ending-style:blur-[calc(2px*var(--kf-flourish,1))] data-ending-style:duration-[calc(150ms*var(--kf-speed,1))] data-ending-style:ease-house",
  "motion-reduce:transition-none!",
)
export const comboboxList = cn(
  "relative isolate [anchor-scope:--kf-hl]",
  "before:pointer-events-none before:absolute before:-z-10 before:bg-[color-mix(in_oklch,currentColor_9%,transparent)] before:opacity-0",
  "before:[position-anchor:--kf-hl] before:top-[anchor(top)] before:right-[anchor(right)] before:bottom-[anchor(bottom)] before:left-[anchor(left)]",
  "before:transition-[top,right,bottom,left,opacity] before:duration-[calc(260ms*var(--kf-speed,1))] before:ease-spring",
  "has-[[data-highlighted]]:before:opacity-100",
  "motion-reduce:before:transition-none!",
)

/* An option row's look (ui layer), shared by FilterOption and FilterClear. */
export const row =
  "group/item relative flex min-h-8 cursor-default items-center gap-2.5 rounded-[8px] px-2 py-1.5 text-[13px] leading-[1.3] outline-none select-none data-highlighted:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-40"
