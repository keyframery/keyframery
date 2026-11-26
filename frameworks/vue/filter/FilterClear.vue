<script setup lang="ts">
/* The "Clear filter" row at the foot of the list, centred. Only there while something is chosen;
   choosing it clears the filter. */
import { ComboboxItem } from "@ui-sdk/vue/combobox"
import { computed, useAttrs } from "vue"

import { FILTER_CLEAR } from "@/components/keyframery/core/filter-core"
import { cn } from "@/lib/utils"

import { comboboxRow, row, useFilterState } from "./primitive"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const state = useFilterState("FilterClear")
</script>

<template>
  <ComboboxItem v-if="state.value.length" :value="FILTER_CLEAR" label="Clear filter" v-bind="forwarded" :class="cn(comboboxRow, row, 'justify-center font-medium', attrs.class as any)">
    <template #default="scope"><slot v-bind="scope ?? {}">Clear filter</slot></template>
  </ComboboxItem>
</template>
