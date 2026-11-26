<script setup lang="ts">
/* Toggles in a row: a swatch and a label. A hidden series keeps an outline of its swatch. Prop: side (top | bottom). */
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"

import { ChartLegend as Primitive } from "./parts"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const base = cn(
  "justify-center gap-x-1 gap-y-1 pt-3 data-[side=top]:pt-0 data-[side=top]:pb-3",
  "[&>[data-slot=chart-legend-item]]:h-7 [&>[data-slot=chart-legend-item]]:cursor-pointer [&>[data-slot=chart-legend-item]]:gap-2 [&>[data-slot=chart-legend-item]]:rounded-[8px] [&>[data-slot=chart-legend-item]]:px-2 [&>[data-slot=chart-legend-item]]:text-[12px] [&>[data-slot=chart-legend-item]]:font-medium [&>[data-slot=chart-legend-item]]:leading-none [&>[data-slot=chart-legend-item]]:text-foreground [&>[data-slot=chart-legend-item]]:outline-none",
  "[&>[data-slot=chart-legend-item]]:hover:bg-foreground/[0.04] [&>[data-slot=chart-legend-item]]:focus-visible:ring-2 [&>[data-slot=chart-legend-item]]:focus-visible:ring-ring",
  "[&>[data-slot=chart-legend-item][data-hidden]]:text-muted-foreground",
  "[&_[data-indicator]]:size-2.5 [&_[data-indicator]]:rounded-[3px] [&_[data-indicator]]:bg-[var(--chart-color)]",
  "[&>[data-hidden]>[data-indicator]]:bg-transparent [&>[data-hidden]>[data-indicator]]:shadow-[inset_0_0_0_1.5px_var(--chart-color)]",
)
</script>

<template>
  <Primitive v-bind="forwarded" :class="cn(base, attrs.class as any)">
    <template v-if="$slots.default" #default="scope"><slot v-bind="scope ?? {}" /></template>
  </Primitive>
</template>
