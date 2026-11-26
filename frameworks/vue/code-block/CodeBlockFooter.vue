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
const base = "flex min-w-0 shrink-0 items-center gap-2 border-t border-border/70 px-[var(--code-block-inset-x,0.875rem)] py-2 text-[12px] text-[color:var(--code-block-muted,var(--muted-foreground))]"
</script>

<template>
  <parts.Footer v-bind="forwarded" :class="cn(base, attrs.class as any)">
    <template #default="scope"><slot v-bind="scope ?? {}" /></template>
  </parts.Footer>
</template>
