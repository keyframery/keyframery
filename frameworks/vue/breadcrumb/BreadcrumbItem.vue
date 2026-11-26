<script setup lang="ts">
/* Arrives from the side, out of a blur. */
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"

import { parts } from "./parts"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const base = "transition-[opacity,translate,filter] duration-[calc(460ms*var(--kf-speed,1)*var(--kf-flourish,1))] ease-spring starting:opacity-0 starting:translate-x-4 starting:blur-[4px] rtl:starting:-translate-x-4 [transition-delay:calc((min(sibling-index(),12)-1)*calc(36ms*var(--kf-speed,1))*var(--kf-flourish,1))] group-data-settled/breadcrumb:[transition-delay:0ms] motion-reduce:transition-none! inline-flex min-w-0 items-center gap-[var(--breadcrumb-item-gap,0.375rem)]"
</script>

<template>
  <parts.Item v-bind="forwarded" :class="cn(base, attrs.class as any)">
    <template v-for="(_, name) in $slots" #[name]="scope"><slot :name="name" v-bind="scope ?? {}" /></template>
  </parts.Item>
</template>
