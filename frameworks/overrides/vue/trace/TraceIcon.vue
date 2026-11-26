<script setup lang="ts">
/* Decorative, 16px. With no content it shows its line's status; pass your own icon to name the action. */
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"
import TraceMarks from "./TraceMarks.vue"
import { TraceIconPart, traceIconClass } from "./parts"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
</script>

<template>
  <TraceIconPart v-bind="forwarded" :class="cn(traceIconClass, attrs.class as any)">
    <template #default="scope"><slot v-bind="scope"><TraceMarks /></slot></template>
  </TraceIconPart>
</template>
