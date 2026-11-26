<script setup lang="ts">
/* The toolbar row of filters. Marks data-active while any filter inside has a value; wraps at phone
   width, and is the container the chips read their width from. */
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"

import { filterBarParts } from "./primitive"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
</script>

<template>
  <filterBarParts.Root aria-label="Filters" v-bind="forwarded" :class="cn('@container/filter-bar flex w-full flex-wrap items-center gap-2', attrs.class as any)">
    <template #default="scope"><slot v-bind="scope ?? {}" /></template>
  </filterBarParts.Root>
</template>
