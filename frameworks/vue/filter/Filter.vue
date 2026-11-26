<script setup lang="ts">
/* Styled faceted filter (src/components/ui/filter.tsx): a chip with a dashed outline that names a column;
   its list is searchable, every option has a box, an optional icon and a count; what is chosen shows in
   the chip as small badges after a hairline. With no default slot, the whole filter renders from
   `options`; pass a slot to compose the parts yourself (FilterTrigger, FilterContent, FilterOption, …).

   Motion: the list unfolds out of its chip, rows cascade in under one gliding highlight, the chosen
   values' box widens on a spring as badges pop in, and counts roll. */
import type { ChangeDetails } from "@ui-sdk/core"
import { computed, useAttrs, useSlots } from "vue"

import { Speed, type Speed as SpeedValue } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

import FilterClear from "./FilterClear.vue"
import FilterContent from "./FilterContent.vue"
import FilterEmpty from "./FilterEmpty.vue"
import FilterInput from "./FilterInput.vue"
import FilterList from "./FilterList.vue"
import FilterOption from "./FilterOption.vue"
import FilterSeparator from "./FilterSeparator.vue"
import FilterTrigger from "./FilterTrigger.vue"
import FilterValues from "./FilterValues.vue"
import { FilterRoot } from "./primitive"
import type { FilterItem } from "./types"

defineOptions({ inheritAttrs: false })
const props = withDefaults(
  defineProps<{
    speed?: SpeedValue
    /** The column or facet the filter narrows, like "Status". */
    label?: string
    /** The values to choose from, each with an optional `icon` and `count`. */
    options?: readonly FilterItem[]
    value?: string[]
    defaultValue?: string[]
    multiple?: boolean
    open?: boolean
    defaultOpen?: boolean
    /** Passed to the combobox inside, like `loop` or `autoHighlight`. */
    comboboxProps?: Record<string, unknown>
    /** How many chosen values show as badges before they read "3 selected". */
    maxBadges?: number
    /** The search field's placeholder. Defaults to the label. */
    placeholder?: string
    /** What the list says when nothing matches. */
    emptyText?: string
    /** Leaves out the search field. */
    hideSearch?: boolean
  }>(),
  {
    speed: undefined,
    label: undefined,
    options: undefined,
    value: undefined,
    defaultValue: undefined,
    multiple: undefined,
    open: undefined,
    defaultOpen: undefined,
    comboboxProps: undefined,
    maxBadges: 2,
    placeholder: undefined,
    emptyText: "No results.",
    hideSearch: false,
  },
)
const emit = defineEmits<{
  "value-change": [value: string[], details: ChangeDetails<string>]
  "update:value": [value: string[]]
  "open-change": [open: boolean, details: ChangeDetails<string>]
  "update:open": [open: boolean]
}>()
const attrs = useAttrs()
const slots = useSlots()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
</script>

<template>
  <Speed :speed="props.speed">
    <FilterRoot
      :label="props.label"
      :options="props.options"
      :value="props.value"
      :default-value="props.defaultValue"
      :multiple="props.multiple"
      :open="props.open"
      :default-open="props.defaultOpen"
      :combobox-props="props.comboboxProps"
      v-bind="forwarded"
      :class="cn('inline-flex', attrs.class as any)"
      @value-change="(v: string[], d: ChangeDetails<string>) => emit('value-change', v, d)"
      @update:value="(v: string[]) => emit('update:value', v)"
      @open-change="(o: boolean, d: ChangeDetails<string>) => emit('open-change', o, d)"
      @update:open="(o: boolean) => emit('update:open', o)"
    >
      <template #default="scope">
        <slot v-if="slots.default" v-bind="scope ?? {}" />
        <template v-else>
          <FilterTrigger>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-plus lucide-plus-circle" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="M8 12h8" /><path d="M12 8v8" /></svg>
            {{ props.label }}
            <FilterValues :max="props.maxBadges" />
          </FilterTrigger>
          <FilterContent>
            <FilterInput v-if="!props.hideSearch" :placeholder="props.placeholder ?? props.label" />
            <FilterEmpty>{{ props.emptyText }}</FilterEmpty>
            <FilterList>
              <FilterOption
                v-for="option in props.options ?? []"
                :key="option.value"
                :data-value="option.value"
                :value="option.value"
                :label="option.label"
                :disabled="option.disabled"
                :icon="option.icon"
                :count="option.count"
              >
                {{ option.label }}
              </FilterOption>
              <!-- The clear row with the hairline above it; both leave together. -->
              <FilterSeparator class="hidden has-[+[data-slot=combobox-item]]:block" />
              <FilterClear />
            </FilterList>
          </FilterContent>
        </template>
      </template>
    </FilterRoot>
  </Speed>
</template>
