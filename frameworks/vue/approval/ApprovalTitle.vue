<script setup lang="ts">
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"

import { parts } from "./primitive"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const base = "min-w-0 truncate text-[length:var(--approval-title-font,14px)] leading-[1.35] font-semibold tracking-tight text-foreground"
</script>

<template>
  <parts.Title v-bind="forwarded" :class="cn(base, attrs.class as any)">
    <template #default="scope"><slot v-bind="scope ?? {}" /></template>
  </parts.Title>
</template>
