<script setup lang="ts">
/* The donut's hole: one big number over a small label. */
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"

import { ChartCenter as Primitive } from "./parts"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const base = cn(
  "gap-0.5 [&>[data-roll]]:text-[clamp(16px,9cqmin,26px)] [&>[data-roll]]:font-semibold [&>[data-roll]]:tracking-tight [&>span:last-child]:text-[11px] [&>span:last-child]:text-muted-foreground",
)
</script>

<template>
  <Primitive v-bind="forwarded" :class="cn(base, attrs.class as any)">
    <template v-if="$slots.default" #default="scope"><slot v-bind="scope ?? {}" /></template>
  </Primitive>
</template>
