<script setup lang="ts">
/* The light runs across a running title. */
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"
import { TraceTitlePart, traceTitleClass } from "./parts"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
</script>

<template>
  <TraceTitlePart v-bind="forwarded" :class="cn(traceTitleClass, attrs.class as any)">
    <template #default="scope"><slot v-bind="scope" /></template>
  </TraceTitlePart>
</template>
