<script setup lang="ts">
/* The options. One highlight glides between them (the combobox's own list motion). */
import { ComboboxList } from "@ui-sdk/vue/combobox"
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"

import { comboboxList } from "./primitive"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const base = cn(
  comboboxList,
  "max-h-[min(calc(var(--list-height,100vh)-56px),17rem)] scroll-py-1.5 overflow-y-auto overscroll-contain p-1.5 outline-none",
  "group-has-[[data-slot=combobox-empty][data-empty]]/content:hidden",
  "before:rounded-[8px] before:bg-accent",
)
</script>

<template>
  <ComboboxList v-bind="forwarded" :class="cn(base, attrs.class as any)">
    <template #default="scope"><slot v-bind="scope ?? {}" /></template>
  </ComboboxList>
</template>
