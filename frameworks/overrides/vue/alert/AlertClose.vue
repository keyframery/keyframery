<script setup lang="ts">
/* Dismisses the alert. A ghost key in the top corner (an x unless you give it content); its press dips and pops back. */
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"

import { parts } from "./parts"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const base = cn(
  "animate-[kf-alert-rise_calc(480ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-spring)_backwards] motion-reduce:animate-none",
  "[animation-delay:calc(200ms*var(--kf-speed,1)*var(--kf-flourish,1))]",
  "transition-[scale] duration-[calc(200ms*var(--kf-speed,1))] ease-pop active:scale-[calc(1-0.12*var(--kf-flourish,1))] motion-reduce:transition-none",
  "absolute top-3 right-3 inline-flex size-7 cursor-pointer items-center justify-center rounded-[8px] text-[color:var(--alert-muted,var(--muted-foreground))] outline-none",
  "hover:bg-foreground/[0.05] hover:text-foreground",
  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card",
  "[&_svg]:size-4",
)
</script>

<template>
  <parts.Close aria-label="Dismiss" v-bind="forwarded" :class="cn(base, attrs.class as any)">
    <template #default="scope">
      <slot v-bind="scope ?? {}">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true">
          <path d="M4 4l8 8M12 4l-8 8" />
        </svg>
      </slot>
    </template>
  </parts.Close>
</template>
