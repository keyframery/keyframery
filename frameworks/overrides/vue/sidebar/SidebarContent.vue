<script setup lang="ts">
/* Holds the groups. The current page's key (its ::before) glides from item to item, across groups. */
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"
import { contentClass, parts } from "./parts"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
</script>

<template>
  <parts.Content v-bind="forwarded" :class="cn(contentClass, attrs.class as any)">
    <template #default="scope"><slot v-bind="scope" /></template>
  </parts.Content>
</template>
