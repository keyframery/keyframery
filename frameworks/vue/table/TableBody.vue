<script setup lang="ts">
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"
import { bodyClass, TableBodyPart } from "./parts"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
</script>

<template>
  <TableBodyPart v-bind="forwarded" :class="cn(bodyClass, attrs.class as any)">
    <template #default="scope"><slot v-bind="scope" /></template>
  </TableBodyPart>
</template>
