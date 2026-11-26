<script setup lang="ts">
/* Read receipts, "Edited", a time: under the last bubble, last to rise. */
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"
import { footerClass, MessageFooterPart } from "./parts"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
</script>

<template>
  <MessageFooterPart v-bind="forwarded" :class="cn(footerClass, attrs.class as any)">
    <template #default="scope"><slot v-bind="scope" /></template>
  </MessageFooterPart>
</template>
