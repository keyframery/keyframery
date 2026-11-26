<script setup lang="ts">
/* The words: they rise in, and while pending a light sweeps across them. */
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"
import { contentLook, contentMotion, MarkerContentPart } from "./parts"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
</script>

<template>
  <MarkerContentPart v-bind="forwarded" :class="cn(contentMotion, contentLook, attrs.class as any)">
    <template #default="scope"><slot v-bind="scope" /></template>
  </MarkerContentPart>
</template>
