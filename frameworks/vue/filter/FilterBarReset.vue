<script setup lang="ts">
/* Clears every filter in the bar. Slides in from the left while one is active, and out again. */
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"

import { filterBarParts, press } from "./primitive"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const base = cn(
  press,
  "transition-[opacity,translate,filter,scale,background-color,color] duration-[calc(420ms*var(--kf-speed,1))] ease-spring",
  "data-hidden:pointer-events-none data-hidden:-translate-x-2 data-hidden:opacity-0 data-hidden:blur-[calc(3px*var(--kf-flourish,1))] data-hidden:duration-[calc(180ms*var(--kf-speed,1))] data-hidden:ease-house",
  "inline-flex h-[var(--filter-height,2rem)] cursor-pointer items-center gap-1.5 rounded-[var(--filter-radius,9px)] px-2.5 text-[13px] leading-none font-medium text-muted-foreground outline-none hover:bg-[color-mix(in_oklab,var(--foreground)_5%,transparent)] hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
)
</script>

<template>
  <filterBarParts.Reset v-bind="forwarded" :class="cn(base, attrs.class as any)">
    <template #default="scope">
      <slot v-bind="scope ?? {}">
        Reset
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x" aria-hidden="true"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
      </slot>
    </template>
  </filterBarParts.Reset>
</template>
