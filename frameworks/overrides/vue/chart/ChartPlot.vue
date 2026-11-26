<script setup lang="ts">
/* The plot. The points are the keyboard's targets: a ring shows on the one focused. */
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"

import { ChartPlot as Primitive } from "./parts"
import ChartGrid from "./ChartGrid.vue"
import ChartCursor from "./ChartCursor.vue"
import ChartMarks from "./ChartMarks.vue"
import ChartCenter from "./ChartCenter.vue"
import ChartTooltip from "./ChartTooltip.vue"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const base = cn(
  "[&_[data-slot=chart-point]]:rounded-[10px] [&_[data-slot=chart-point]]:focus-visible:shadow-[inset_0_0_0_2px_var(--ring)]",
  "group-data-[type=pie]/chart:[&_[data-slot=chart-point]]:rounded-full group-data-[type=donut]/chart:[&_[data-slot=chart-point]]:rounded-full",
  "group-data-[type=pie]/chart:[&_[data-slot=chart-point]]:focus-visible:shadow-[0_0_0_2px_var(--ring),0_0_0_4px_var(--background)]",
  "group-data-[type=donut]/chart:[&_[data-slot=chart-point]]:focus-visible:shadow-[0_0_0_2px_var(--ring),0_0_0_4px_var(--background)]",
)
</script>

<template>
  <Primitive v-bind="forwarded" :class="cn(base, attrs.class as any)">
    <template #default="scope"><slot v-bind="scope ?? {}">
      <ChartGrid />
      <ChartCursor />
      <ChartMarks />
      <ChartCenter />
      <ChartTooltip />
    </slot></template>
  </Primitive>
</template>
