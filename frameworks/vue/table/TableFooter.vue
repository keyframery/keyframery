<script setup lang="ts">
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"
import { footerClass, TableFooterPart } from "./parts"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
</script>

<template>
  <TableFooterPart v-bind="forwarded" :class="cn(footerClass, attrs.class as any)">
    <template #default="scope"><slot v-bind="scope" /></template>
  </TableFooterPart>
</template>
