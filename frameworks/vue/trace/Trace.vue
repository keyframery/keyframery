<script setup lang="ts">
/* A trace: the steps an assistant or a job went through, one line each. Lines rise in one after another. */
import { computed, useAttrs } from "vue"

import { type Speed, useSpeed } from "@/lib/keyframery"
import { cn } from "@/lib/utils"
import { TraceRoot, traceClass } from "./parts"

defineOptions({ inheritAttrs: false })
const props = defineProps<{ speed?: Speed }>()
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs
  return rest
})
const speedStyle = useSpeed(() => props.speed)
</script>

<template>
  <TraceRoot v-bind="forwarded" :style="[speedStyle, attrs.style as any]" :class="cn(traceClass, attrs.class as any)">
    <template #default="scope"><slot v-bind="scope" /></template>
  </TraceRoot>
</template>

<style>
/* kf-trace: the keyframes this part animates with (React's <style href="kf-trace">), shipped with the component. */
@keyframes kf-trace-row{from{opacity:0;translate:0 8px;filter:blur(4px)}}@keyframes kf-trace-shimmer{from{background-position:100% 0}to{background-position:0% 0}}@keyframes kf-trace-tick{from{stroke-dashoffset:1}}@keyframes kf-trace-pop{from{scale:0.4;opacity:0}}
</style>
