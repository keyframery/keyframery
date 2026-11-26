<script setup lang="ts">
/* Bars in the series colour, rounded at their open ends; 2px lines with round joins; dots ringed in the card colour. */
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"

import { ChartMarks as Primitive } from "./parts"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const base = cn(
  "[&>[data-slot=chart-bar]]:bg-[var(--chart-color)]",
  "[&>[data-slot=chart-bar][data-end]]:rounded-t-[var(--chart-radius,max(0px,calc(var(--radius,0.625rem)-6px)))] [&>[data-slot=chart-bar][data-start]]:rounded-b-[var(--chart-radius,max(0px,calc(var(--radius,0.625rem)-6px)))]",
  "group-data-[orientation=horizontal]/chart:[&>[data-slot=chart-bar]]:rounded-none group-data-[orientation=horizontal]/chart:[&>[data-slot=chart-bar][data-end]]:rounded-r-[var(--chart-radius,max(0px,calc(var(--radius,0.625rem)-6px)))] group-data-[orientation=horizontal]/chart:[&>[data-slot=chart-bar][data-start]]:rounded-l-[var(--chart-radius,max(0px,calc(var(--radius,0.625rem)-6px)))]",
  "[&_[data-slot=chart-line]]:[stroke:var(--chart-color)] [&_[data-slot=chart-line]]:[stroke-width:var(--chart-stroke,2px)] [&_[data-slot=chart-line]]:[stroke-linecap:round] [&_[data-slot=chart-line]]:[stroke-linejoin:round]",
  "[&>[data-slot=chart-dot]]:rounded-full [&>[data-slot=chart-dot]]:bg-[var(--chart-color)] [&>[data-slot=chart-dot]]:shadow-[0_0_0_2px_var(--card)]",
  "[&>[data-slot=chart-marker]]:rounded-full [&>[data-slot=chart-marker]]:bg-[var(--chart-color)] [&>[data-slot=chart-marker]]:shadow-[0_0_0_2.5px_var(--card),0_1px_4px_rgb(0_0_0/0.22)] dark:[&>[data-slot=chart-marker]]:shadow-[0_0_0_2.5px_var(--card),0_1px_4px_rgb(0_0_0/0.6)]",
  "[&_[data-slot=chart-slice]]:[stroke:var(--chart-color)]",
)
</script>

<template>
  <Primitive v-bind="forwarded" :class="cn(base, attrs.class as any)">
    <template v-if="$slots.default" #default="scope"><slot v-bind="scope ?? {}" /></template>
  </Primitive>
</template>
