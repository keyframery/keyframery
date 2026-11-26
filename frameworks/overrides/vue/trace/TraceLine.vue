<script setup lang="ts">
/* One step. `status`: "running", "error" or "pending"; leave it out for a step that finished. */
import { computed, useAttrs } from "vue"

import type { TraceStatus } from "@/components/keyframery/core/trace-core"
import { cn } from "@/lib/utils"
import { TraceLinePart, traceLineClass } from "./parts"

defineOptions({ inheritAttrs: false })
defineProps<{ status?: TraceStatus }>()
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
</script>

<template>
  <TraceLinePart v-bind="forwarded" :status="status" :class="cn(traceLineClass, attrs.class as any)">
    <template #default="scope"><slot v-bind="scope" /></template>
  </TraceLinePart>
</template>
