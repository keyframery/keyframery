<script setup lang="ts">
/* One value to choose: box, icon, label and a count at the end that rolls when it changes. Cascades in
   with the list (the combobox's row motion). */
import { ComboboxItem } from "@ui-sdk/vue/combobox"
import { computed, useAttrs, type Component } from "vue"

import { Roll } from "@/components/keyframery/badge"
import { cn } from "@/lib/utils"

import FilterOptionIndicator from "./FilterOptionIndicator.vue"
import { comboboxRow, row } from "./primitive"

defineOptions({ inheritAttrs: false })
const props = defineProps<{ value: string; label?: string; disabled?: boolean; icon?: Component; count?: number }>()
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
</script>

<template>
  <ComboboxItem :value="props.value" :label="props.label" :disabled="props.disabled" v-bind="forwarded" :class="cn(comboboxRow, row, attrs.class as any)">
    <template #default="scope">
      <FilterOptionIndicator />
      <span v-if="props.icon" class="grid size-4 shrink-0 place-items-center text-muted-foreground [&_svg]:size-3.5"><component :is="props.icon" /></span>
      <span class="min-w-0 flex-1 truncate"><slot v-bind="scope ?? {}" /></span>
      <span v-if="props.count !== undefined" class="ml-auto pl-2 font-mono text-[12px] text-muted-foreground tabular-nums">
        <Roll :text="String(props.count)" />
        <span class="sr-only">{{ props.count }}</span>
      </span>
    </template>
  </ComboboxItem>
</template>
