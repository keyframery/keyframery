<script setup lang="ts">
/* The axis along the bottom: the categories, or the values for horizontal bars. */
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"

import { ChartXAxis as Primitive } from "./parts"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const base = cn(
  "pt-2.5",
  "[&>[data-slot=chart-tick]]:text-[11px] [&>[data-slot=chart-tick]]:leading-[1.3] [&>[data-slot=chart-tick]]:text-[color:var(--chart-axis,var(--muted-foreground))] [&>[data-slot=chart-tick]]:tabular-nums",
)
</script>

<template>
  <Primitive v-bind="forwarded" :class="cn(base, attrs.class as any)">
    <template v-if="$slots.default" #default="scope"><slot v-bind="scope ?? {}" /></template>
  </Primitive>
</template>
