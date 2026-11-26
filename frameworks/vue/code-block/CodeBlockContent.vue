<script setup lang="ts">
/* The scrolling `pre`, on a slightly sunk ground. With no content it renders a styled line for every line of the code. */
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"

import CodeBlockLine from "./CodeBlockLine.vue"
import { parts } from "./parts"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const base = cn(
  "isolate",
  "min-h-0 min-w-0 overflow-auto py-[var(--code-block-inset-y,0.75rem)] font-mono text-[length:var(--code-block-font,12.5px)] leading-[1.7] outline-none [scrollbar-width:thin]",
  "bg-[color-mix(in_oklab,var(--muted)_45%,var(--card))] dark:bg-[color-mix(in_oklab,var(--muted)_35%,var(--card))]",
  "group-data-[size=sm]/code-block:py-2 group-data-[size=sm]/code-block:text-[11.5px]",
  "data-wrap:whitespace-pre-wrap data-wrap:break-words",
)
</script>

<template>
  <parts.Content v-bind="forwarded" :class="cn(base, attrs.class as any)">
    <template #default="{ state }">
      <slot :state="state">
        <code data-slot="code-block-code" class="block min-w-max in-data-wrap:min-w-0"><CodeBlockLine v-for="number in state.numbers" :key="number" :value="number" /></code>
      </slot>
    </template>
  </parts.Content>
</template>
