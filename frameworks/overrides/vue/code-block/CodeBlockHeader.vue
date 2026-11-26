<script setup lang="ts">
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"

import { parts } from "./parts"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const base = "flex h-10 min-w-0 shrink-0 items-center gap-2 border-b border-border/70 ps-3.5 pe-1.5 text-[color:var(--code-block-muted,var(--muted-foreground))] group-data-[size=sm]/code-block:h-8 group-data-[size=sm]/code-block:ps-3 group-data-[variant=destructive]/code-block:text-destructive"
</script>

<template>
  <parts.Header v-bind="forwarded" :class="cn(base, attrs.class as any)">
    <template #default="scope"><slot v-bind="scope ?? {}" /></template>
  </parts.Header>
</template>
