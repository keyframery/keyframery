<script setup lang="ts">
/* A light sheet: the category, then a row per series with its swatch, name and value. Props: indicator (dot | line | dashed), hideLabel. */
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"

import { ChartTooltip as Primitive } from "./parts"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const base = cn(
  "min-w-[8.5rem] rounded-[10px] bg-[var(--chart-tooltip,var(--popover))] px-2.5 py-2 text-[12px] text-popover-foreground",
  "shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_2px_6px_-2px_rgb(0_0_0/0.08),0_12px_32px_-8px_rgb(0_0_0/0.18)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_12px_32px_-8px_rgb(0_0_0/0.7)]",
  "[&>[data-slot=chart-tooltip-label]]:mb-1.5 [&>[data-slot=chart-tooltip-label]]:font-medium [&>[data-slot=chart-tooltip-label]]:leading-none",
  "[&>[data-slot=chart-tooltip-item]]:grid [&>[data-slot=chart-tooltip-item]]:grid-cols-[auto_1fr_auto] [&>[data-slot=chart-tooltip-item]]:items-center [&>[data-slot=chart-tooltip-item]]:gap-x-2 [&>[data-slot=chart-tooltip-item]]:py-[3px] [&>[data-slot=chart-tooltip-item]]:leading-[1.3]",
  "[&>[data-slot=chart-tooltip-item]>span:nth-child(2)]:text-muted-foreground [&>[data-slot=chart-tooltip-item]>[data-roll]]:pl-3 [&>[data-slot=chart-tooltip-item]>[data-roll]]:font-medium",
  "[&_[data-indicator]]:size-2 [&_[data-indicator]]:rounded-[2.5px] [&_[data-indicator]]:bg-[var(--chart-color)]",
  "[&>[data-slot=chart-tooltip-total]]:mt-1.5 [&>[data-slot=chart-tooltip-total]]:flex [&>[data-slot=chart-tooltip-total]]:items-center [&>[data-slot=chart-tooltip-total]]:justify-between [&>[data-slot=chart-tooltip-total]]:gap-3 [&>[data-slot=chart-tooltip-total]]:border-t [&>[data-slot=chart-tooltip-total]]:border-border [&>[data-slot=chart-tooltip-total]]:pt-1.5 [&>[data-slot=chart-tooltip-total]]:leading-[1.3] [&>[data-slot=chart-tooltip-total]]:font-medium",
  "data-[indicator=line]:[&_[data-indicator]]:h-3 data-[indicator=line]:[&_[data-indicator]]:w-1 data-[indicator=line]:[&_[data-indicator]]:rounded-full",
  "data-[indicator=dashed]:[&_[data-indicator]]:h-3 data-[indicator=dashed]:[&_[data-indicator]]:w-0 data-[indicator=dashed]:[&_[data-indicator]]:rounded-none data-[indicator=dashed]:[&_[data-indicator]]:border-l-[1.5px] data-[indicator=dashed]:[&_[data-indicator]]:border-dashed data-[indicator=dashed]:[&_[data-indicator]]:border-[color:var(--chart-color)] data-[indicator=dashed]:[&_[data-indicator]]:bg-transparent",
)
</script>

<template>
  <Primitive v-bind="forwarded" :class="cn(base, attrs.class as any)">
    <template v-if="$slots.default" #default="scope"><slot v-bind="scope ?? {}" /></template>
  </Primitive>
</template>
