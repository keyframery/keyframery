<script setup lang="ts">
/* This page. When a link becomes the page, its colour eases over. */
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"

import { parts } from "./parts"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const base = "[transition:color_calc(200ms*var(--kf-speed,1))_var(--ease-house)] motion-reduce:[transition:none]! inline-flex items-center gap-[var(--breadcrumb-item-gap,0.375rem)] font-medium text-[color:var(--breadcrumb-current,var(--foreground))] [&_svg]:size-[var(--breadcrumb-icon-size,0.875rem)] [&_svg]:shrink-0"
</script>

<template>
  <parts.Page v-bind="forwarded" :class="cn(base, attrs.class as any)">
    <template v-for="(_, name) in $slots" #[name]="scope"><slot :name="name" v-bind="scope ?? {}" /></template>
  </parts.Page>
</template>
