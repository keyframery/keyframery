<script setup lang="ts">
/* Hairline rules; the zero line a step stronger. */
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"

import { ChartGrid as Primitive } from "./parts"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const base = cn(
  "[&>[data-slot=chart-grid-line]]:border-t [&>[data-slot=chart-grid-line]]:border-[color:color-mix(in_oklch,var(--chart-grid,var(--border))_75%,transparent)]",
  "[&>[data-slot=chart-grid-line][data-zero]]:border-[color:var(--chart-grid,var(--border))]",
  "group-data-[orientation=horizontal]/chart:group-data-[type=bar]/chart:[&>[data-slot=chart-grid-line]]:border-t-0 group-data-[orientation=horizontal]/chart:group-data-[type=bar]/chart:[&>[data-slot=chart-grid-line]]:border-l",
)
</script>

<template>
  <Primitive v-bind="forwarded" :class="cn(base, attrs.class as any)">
    <template v-if="$slots.default" #default="scope"><slot v-bind="scope ?? {}" /></template>
  </Primitive>
</template>
