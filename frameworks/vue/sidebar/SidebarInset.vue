<script setup lang="ts">
/* The page beside the sidebar. */
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"
import { insetClass, parts } from "./parts"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
</script>

<template>
  <parts.Inset v-bind="forwarded" :class="cn(insetClass, attrs.class as any)">
    <template #default="scope"><slot v-bind="scope" /></template>
  </parts.Inset>
</template>
