<script setup lang="ts">
/* A count or a duration after the title. It never truncates. */
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"
import { TraceDescriptionPart, traceDescriptionClass } from "./parts"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
</script>

<template>
  <TraceDescriptionPart v-bind="forwarded" :class="cn(traceDescriptionClass, attrs.class as any)">
    <template #default="scope"><slot v-bind="scope" /></template>
  </TraceDescriptionPart>
</template>
