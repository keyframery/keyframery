<script setup lang="ts">
/* A key that flips the direction (aria-pressed while right to left), with a mirror icon that turns over on a spring. */
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
  "transition-[scale] duration-[calc(220ms*var(--kf-speed,1))] ease-pop active:scale-[calc(1-0.04*var(--kf-flourish,1))] active:duration-[calc(90ms*var(--kf-speed,1))] active:ease-house",
  "[&_svg]:transition-[scale] [&_svg]:duration-[calc(520ms*var(--kf-speed,1))] [&_svg]:ease-spring data-[dir=rtl]:[&_svg]:-scale-x-100",
  "motion-reduce:transition-none! motion-reduce:[&_svg]:transition-none!",
  "inline-flex h-[var(--direction-height,2rem)] cursor-pointer items-center justify-center gap-[var(--direction-gap,0.375rem)] rounded-[var(--direction-radius,9px)] px-[var(--direction-inset-x,0.75rem)] text-[length:var(--direction-font,13px)] leading-none font-medium whitespace-nowrap text-[color:var(--direction-ink,var(--foreground))] outline-none select-none [&_svg]:size-[var(--direction-icon-size,1rem)] [&_svg]:shrink-0",
  "bg-[var(--direction-face,var(--background))] shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_1px_rgb(0_0_0/0.05),0_3px_6px_-2px_rgb(0_0_0/0.1)]",
  "dark:bg-[var(--direction-face,var(--accent))] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07),inset_0_1px_0_rgb(255_255_255/0.08),0_2px_6px_-1px_rgb(0_0_0/0.6)]",
  "hover:bg-[color-mix(in_oklab,var(--background),var(--foreground)_3%)] dark:hover:bg-[color-mix(in_oklab,var(--accent),var(--foreground)_7%)]",
  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
)
</script>

<template>
  <parts.Toggle v-bind="forwarded" :class="cn(base, attrs.class as any)">
    <template v-if="$slots.render" #render="scope"><slot name="render" v-bind="scope" /></template>
    <template #default="scope">
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M3 5.5h9.5M10 3l2.5 2.5L10 8" />
        <path d="M13 10.5H3.5M6 8l-2.5 2.5L6 13" opacity="0.5" />
      </svg>
      <slot v-bind="scope ?? {}" />
    </template>
  </parts.Toggle>
</template>
