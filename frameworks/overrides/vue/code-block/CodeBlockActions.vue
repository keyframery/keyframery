<script setup lang="ts">
/* Buttons at the end of the header. As a direct child of CodeBlock it floats over the code's corner and shows on hover or focus. */
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"

import { parts } from "./parts"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const base = "ms-auto flex shrink-0 items-center gap-1 [[data-slot=code-block]>&]:absolute [[data-slot=code-block]>&]:end-2 [[data-slot=code-block]>&]:top-2 [[data-slot=code-block]>&]:z-10 [[data-slot=code-block]>&]:opacity-0 [[data-slot=code-block]>&]:transition-opacity [[data-slot=code-block]>&]:duration-[calc(150ms*var(--kf-speed,1))] group-hover/code-block:[[data-slot=code-block]>&]:opacity-100 group-focus-within/code-block:[[data-slot=code-block]>&]:opacity-100 group-data-copied/code-block:[[data-slot=code-block]>&]:opacity-100 pointer-coarse:[[data-slot=code-block]>&]:opacity-100 motion-reduce:transition-none"
</script>

<template>
  <parts.Actions v-bind="forwarded" :class="cn(base, attrs.class as any)">
    <template #default="scope"><slot v-bind="scope ?? {}" /></template>
  </parts.Actions>
</template>
