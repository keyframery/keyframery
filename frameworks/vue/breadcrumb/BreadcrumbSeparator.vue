<script setup lang="ts">
/* Draws a chevron unless you pass your own mark; it arrives with the crumbs and its stroke draws itself. */
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"

import { parts } from "./parts"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const base =
  "transition-[opacity,translate,filter] duration-[calc(460ms*var(--kf-speed,1)*var(--kf-flourish,1))] ease-spring starting:opacity-0 starting:translate-x-4 starting:blur-[4px] rtl:starting:-translate-x-4 [transition-delay:calc((min(sibling-index(),12)-1)*calc(36ms*var(--kf-speed,1))*var(--kf-flourish,1))] group-data-settled/breadcrumb:[transition-delay:0ms] motion-reduce:transition-none! inline-flex text-[color:var(--breadcrumb-separator,color-mix(in_oklab,var(--muted-foreground)_60%,transparent))] [&>svg]:size-[var(--breadcrumb-icon-size,0.875rem)]"
</script>

<template>
  <parts.Separator v-bind="forwarded" :class="cn(base, attrs.class as any)">
    <template #default="scope">
      <slot v-bind="scope ?? {}">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="rtl:-scale-x-100">
          <path
            d="m6.5 3.5 4.5 4.5-4.5 4.5"
            pathLength="1"
            class="[stroke-dasharray:1] [stroke-dashoffset:0] starting:[stroke-dashoffset:1] [transition:stroke-dashoffset_calc(300ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-house)_calc(80ms*var(--kf-speed,1)*var(--kf-flourish,1))] motion-reduce:[transition:none]!"
          />
        </svg>
      </slot>
    </template>
  </parts.Separator>
</template>
