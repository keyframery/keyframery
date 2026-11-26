<script setup lang="ts">
/* A row that expands: Keyframery's collapsible. It takes the props of Collapsible. */
import { computed, useAttrs } from "vue"

import { Collapsible } from "@/components/keyframery/collapsible"
import { cn } from "@/lib/utils"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
</script>

<template>
  <Collapsible data-trace="" v-bind="forwarded" :class="cn('w-full min-w-0', attrs.class as any)">
    <template #default="scope"><slot v-bind="scope ?? {}" /></template>
  </Collapsible>
</template>
