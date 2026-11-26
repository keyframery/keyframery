<script setup lang="ts">
/* The axis up the left side: the values, or the categories for horizontal bars. */
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"

import { ChartYAxis as Primitive } from "./parts"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const base = cn(
  "pr-3 text-right",
  "[&>[data-slot=chart-tick]]:text-[11px] [&>[data-slot=chart-tick]]:leading-[1.3] [&>[data-slot=chart-tick]]:text-[color:var(--chart-axis,var(--muted-foreground))] [&>[data-slot=chart-tick]]:tabular-nums [&>[data-slot=chart-tick]]:justify-self-end",
)
</script>

<template>
  <Primitive v-bind="forwarded" :class="cn(base, attrs.class as any)">
    <template v-if="$slots.default" #default="scope"><slot v-bind="scope ?? {}" /></template>
  </Primitive>
</template>
