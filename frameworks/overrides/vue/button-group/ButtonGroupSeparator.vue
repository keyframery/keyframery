<script setup lang="ts">
/* A hairline between segments (UI SDK's Separator), for a split button whose two halves share one surface. It runs
   across the group, so it is vertical in a row; the line draws in from its centre (scales with --kf-flourish). */
import { Separator as SeparatorPart } from "@ui-sdk/vue/separator"
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{ orientation?: "horizontal" | "vertical"; decorative?: boolean }>(), { orientation: "vertical", decorative: true })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const base = cn(
  "relative z-10 shrink-0 self-stretch",
  "data-[orientation=vertical]:animate-[kf-button-group-sep-y_calc(420ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-spring)_both]",
  "data-[orientation=horizontal]:animate-[kf-button-group-sep-x_calc(420ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-spring)_both]",
  "motion-reduce:animate-none!",
  "bg-[var(--button-group-line,var(--border))]",
  "data-[orientation=vertical]:my-2 data-[orientation=vertical]:w-px data-[orientation=horizontal]:mx-2 data-[orientation=horizontal]:h-px",
)
</script>

<template>
  <SeparatorPart :orientation="props.orientation" :decorative="props.decorative" v-bind="forwarded" :class="cn(base, attrs.class as any)" />
</template>

<style>
@keyframes kf-button-group-sep-y { from { scale: 1 0 } }
@keyframes kf-button-group-sep-x { from { scale: 0 1 } }
</style>
