<script setup lang="ts">
/* A filename or a label, with an optional 14px icon before it. It truncates. */
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"

import { parts } from "./parts"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const base = "flex min-w-0 items-center gap-1.5 truncate text-[length:var(--code-block-font,12.5px)] leading-none font-medium text-foreground [&_svg]:size-3.5 [&_svg]:shrink-0 [&_svg]:text-[color:var(--code-block-muted,var(--muted-foreground))] group-data-[variant=destructive]/code-block:text-destructive"
</script>

<template>
  <parts.Title v-bind="forwarded" :class="cn(base, attrs.class as any)">
    <template #default="scope"><slot v-bind="scope ?? {}" /></template>
  </parts.Title>
</template>
