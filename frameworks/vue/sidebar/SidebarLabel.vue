<script setup lang="ts">
/* Wrap the words of a menu button in this so they fold away on the rail. */
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"
import { parts } from "./parts"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
</script>

<template>
  <parts.Label v-bind="forwarded" :class="cn(attrs.class as any)">
    <template #default="scope"><slot v-bind="scope" /></template>
  </parts.Label>
</template>
