<script setup lang="ts">
/* The sender and the time, small, above the first bubble. */
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"
import { headerClass, MessageHeaderPart } from "./parts"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
</script>

<template>
  <MessageHeaderPart v-bind="forwarded" :class="cn(headerClass, attrs.class as any)">
    <template #default="scope"><slot v-bind="scope" /></template>
  </MessageHeaderPart>
</template>
