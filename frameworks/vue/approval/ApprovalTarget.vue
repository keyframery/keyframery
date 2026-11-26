<script setup lang="ts">
/* What the agent would press: a quiet chip with a pointer, so it reads as a control, not prose. */
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"

import { parts } from "./primitive"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const base =
  "inline-flex h-7 w-fit max-w-full min-w-0 items-center gap-1.5 rounded-[8px] bg-muted px-2.5 text-[12.5px] leading-none font-medium text-foreground shadow-[inset_0_0_0_1px_rgb(0_0_0/0.04)] dark:shadow-[inset_0_0_0_1px_rgb(255_255_255/0.05)]"
</script>

<template>
  <parts.Target v-bind="forwarded" :class="cn(base, attrs.class as any)">
    <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="size-3.5 shrink-0 text-muted-foreground">
      <path d="m3.5 3.5 3.25 9 1.4-3.85 3.85-1.4Z M8.9 8.9l3.6 3.6" />
    </svg>
    <span class="min-w-0 truncate"><slot /></span>
  </parts.Target>
</template>
