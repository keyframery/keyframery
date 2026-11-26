<script setup lang="ts">
/* The bubbles and attachments; they rise in a beat after the header. */
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"
import { contentClass, MessageContentPart } from "./parts"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
</script>

<template>
  <MessageContentPart v-bind="forwarded" :class="cn(contentClass, attrs.class as any)">
    <template #default="scope"><slot v-bind="scope" /></template>
  </MessageContentPart>
</template>
