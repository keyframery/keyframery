<script setup lang="ts">
/* A faint band behind a bar group; a hairline on a line. */
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"

import { ChartCursor as Primitive } from "./parts"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const base = cn(
  "rounded-[calc(var(--chart-radius,max(0px,calc(var(--radius,0.625rem)-6px)))+3px)] bg-[color-mix(in_oklch,var(--chart-cursor,var(--foreground))_5%,transparent)]",
  "group-data-[type=line]/chart:rounded-none group-data-[type=line]/chart:bg-[color-mix(in_oklch,var(--chart-cursor,var(--foreground))_22%,transparent)]",
  "group-data-[type=area]/chart:rounded-none group-data-[type=area]/chart:bg-[color-mix(in_oklch,var(--chart-cursor,var(--foreground))_22%,transparent)]",
)
</script>

<template>
  <Primitive v-bind="forwarded" :class="cn(base, attrs.class as any)">
    <template v-if="$slots.default" #default="scope"><slot v-bind="scope ?? {}" /></template>
  </Primitive>
</template>
