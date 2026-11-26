<script setup lang="ts">
/* One line about the whole submission. It opens its own height and rises in out of a blur, as a field's
   error does. With no slot it shows the message `submit` returned. */
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"

import { parts } from "./parts"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const base = cn(
  "overflow-hidden [interpolate-size:allow-keywords]",
  "[transition:height_calc(480ms*var(--kf-speed,1))_var(--ease-house),opacity_calc(380ms*var(--kf-speed,1))_var(--ease-house),translate_calc(700ms*var(--kf-speed,1))_var(--ease-spring),filter_calc(480ms*var(--kf-speed,1))_var(--ease-house)]",
  "starting:h-0 starting:translate-y-[calc(0.75rem*var(--kf-flourish,1))] starting:opacity-0 starting:blur-[calc(4px*var(--kf-flourish,1))]",
  "motion-reduce:[transition:none]!",
  "text-[12.5px] leading-[1.45] text-[color:var(--form-muted,var(--muted-foreground))]",
  "data-[status=error]:font-medium data-[status=error]:text-destructive",
)
</script>

<template>
  <parts.Status v-bind="forwarded" :class="cn(base, attrs.class as any)">
    <template #default="{ state }"><slot :state="state">{{ state.message }}</slot></template>
  </parts.Status>
</template>
