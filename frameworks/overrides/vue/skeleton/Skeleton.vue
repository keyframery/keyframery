<script setup lang="ts">
/* One placeholder block, hidden from assistive technology, with a sweeping light while `shimmer` is on. */
import { computed, useAttrs } from "vue"

import { type Speed, useSpeed } from "@/lib/keyframery"
import { cn } from "@/lib/utils"
import { SkeletonRoot, skeletonLook, skeletonMotion } from "./parts"

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{ shimmer?: boolean; speed?: Speed }>(), { shimmer: undefined })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs
  return rest
})
const speedStyle = useSpeed(() => props.speed)
</script>

<template>
  <SkeletonRoot v-bind="forwarded" :shimmer="shimmer" :style="[speedStyle, attrs.style as any]" :class="cn(skeletonMotion, skeletonLook, attrs.class as any)">
    <template #default="scope"><slot v-bind="scope" /></template>
  </SkeletonRoot>
</template>

<style>
/* kf-skeleton: the keyframes this part animates with (React's <style href="kf-skeleton">), shipped with the component. */
@keyframes kf-shimmer{0%{translate:-100% 0}62%,100%{translate:100% 0}}
</style>
