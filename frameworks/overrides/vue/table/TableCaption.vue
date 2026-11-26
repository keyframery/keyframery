<script setup lang="ts">
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"
import { captionClass, TableCaptionPart } from "./parts"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
</script>

<template>
  <TableCaptionPart v-bind="forwarded" :class="cn(captionClass, attrs.class as any)">
    <template #default="scope"><slot v-bind="scope" /></template>
  </TableCaptionPart>
</template>
