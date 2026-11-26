<script setup lang="ts">
/* A shield in a tile tinted by the risk; muted once the card is answered. Decorative. */
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"

import { parts } from "./primitive"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const base = cn(
  "grid size-8 shrink-0 place-items-center rounded-[9px] text-[color:var(--approval-tone)] [&_svg]:size-4",
  "bg-[color-mix(in_oklab,var(--approval-tone)_9%,transparent)] dark:bg-[color-mix(in_oklab,var(--approval-tone)_16%,transparent)]",
  "transition-[color,background-color] duration-[calc(240ms*var(--kf-speed,1))] ease-house motion-reduce:transition-none",
  "group-data-resolved/approval:bg-muted group-data-resolved/approval:text-muted-foreground",
)
</script>

<template>
  <parts.Icon v-bind="forwarded" :class="cn(base, attrs.class as any)">
    <template #default="scope">
      <slot v-bind="scope ?? {}">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M8 1.75 13 3.6v3.9c0 3.05-2.15 5.25-5 6.75-2.85-1.5-5-3.7-5-6.75V3.6Z" />
          <path d="M8 5.5v2.75M8 10.5v.01" />
        </svg>
      </slot>
    </template>
  </parts.Icon>
</template>
