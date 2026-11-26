<script setup lang="ts">
/* Shows the `fallback` slot (your skeletons) while `loading`, then crossfades to the default slot.
   Content that mounts only once loaded gets the same entrance through @starting-style. */
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"
import { SkeletonSwapContent, SkeletonSwapFallback, SkeletonSwapRoot, swapContent, swapFallback } from "./parts"

defineOptions({ inheritAttrs: false })
defineProps<{
  loading: boolean
  /** Classes for the content layer, whose direct children cascade in. */
  contentClassName?: string
}>()
defineSlots<{ default?: () => unknown; fallback?: () => unknown }>()
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
</script>

<template>
  <SkeletonSwapRoot v-bind="forwarded" :loading="loading" :class="cn('grid', attrs.class as any)">
    <SkeletonSwapFallback :class="swapFallback"><slot name="fallback" /></SkeletonSwapFallback>
    <SkeletonSwapContent :class="cn(swapContent, contentClassName)"><slot /></SkeletonSwapContent>
  </SkeletonSwapRoot>
</template>
