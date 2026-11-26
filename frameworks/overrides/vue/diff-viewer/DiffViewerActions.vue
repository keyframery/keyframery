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
const base = "ms-auto flex shrink-0 items-center gap-1.5"
</script>

<template>
  <parts.Actions v-bind="forwarded" :class="cn(base, attrs.class as any)">
    <template #default="scope"><slot v-bind="scope ?? {}" /></template>
  </parts.Actions>
</template>
