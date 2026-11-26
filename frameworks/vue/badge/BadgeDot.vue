<script setup lang="ts">
/* The status dot: a solid core (before) and a ring (after) that spreads and fades. Both play on each
   change, keyed on data-pulse. Flourish: at 0 nothing pulses. */
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
  "relative inline-block size-1.5 shrink-0",
  "before:absolute before:inset-0 before:rounded-full before:bg-current",
  "after:absolute after:inset-0 after:rounded-full after:bg-current after:opacity-0",
  "data-[pulse=odd]:before:animate-[kf-badge-in_calc(420ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-pop)_backwards]",
  "data-[pulse=even]:before:animate-[kf-badge-in-b_calc(420ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-pop)_backwards]",
  "data-[pulse=odd]:after:animate-[kf-badge-ping_calc(800ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-house)]",
  "data-[pulse=even]:after:animate-[kf-badge-ping-b_calc(800ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-house)]",
  "motion-reduce:before:animate-none! motion-reduce:after:animate-none!",
)
</script>

<template>
  <parts.Dot v-bind="forwarded" :class="cn(base, attrs.class as any)" />
</template>
