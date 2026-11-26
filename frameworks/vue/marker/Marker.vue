<script setup lang="ts">
/* A short line in a stream of content: plain, between two hairlines (`separator`), or over one (`border`). */
import { computed, useAttrs } from "vue"

import type { MarkerVariant } from "@/components/keyframery/core/marker-core"
import { type Speed, useSpeed } from "@/lib/keyframery"
import { cn } from "@/lib/utils"
import { MarkerRoot, markerLook, markerMotion } from "./parts"

defineOptions({ inheritAttrs: false })
const props = withDefaults(
  defineProps<{
    /** `"separator"` draws a rule on each side of the content, `"border"` a rule under it. */
    variant?: MarkerVariant
    /** Reads the marker out when its text changes, as a status. */
    live?: boolean
    /** The work the marker names is still going on. */
    pending?: boolean
    speed?: Speed
  }>(),
  { live: undefined, pending: undefined },
)
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs
  return rest
})
const speedStyle = useSpeed(() => props.speed)
</script>

<template>
  <MarkerRoot v-bind="forwarded" :variant="variant" :live="live" :pending="pending" :style="[speedStyle, attrs.style as any]" :class="cn(markerMotion, markerLook, attrs.class as any)">
    <template #default="scope"><slot v-bind="scope" /></template>
  </MarkerRoot>
</template>

<style>
/* kf-marker: the keyframes this part animates with (React's <style href="kf-marker">), shipped with the component. */
@keyframes kf-marker-in{from{opacity:0;translate:0 6px;filter:blur(4px)}}@keyframes kf-marker-pop{from{opacity:0;scale:0.5}}@keyframes kf-marker-line{from{scale:0 1}}@keyframes kf-marker-sweep{from{background-position:100% 0}to{background-position:0 0}}
</style>
