<script setup lang="ts">
/* The top of the sidebar: a trigger and a title. */
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"
import { headerClass, parts } from "./parts"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
</script>

<template>
  <parts.Header v-bind="forwarded" :class="cn(headerClass, attrs.class as any)">
    <template #default="scope"><slot v-bind="scope" /></template>
  </parts.Header>
</template>
