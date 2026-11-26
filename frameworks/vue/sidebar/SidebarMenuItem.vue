<script setup lang="ts">
/* One row of a menu. */
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
  <parts.MenuItem v-bind="forwarded" :class="cn(attrs.class as any)">
    <template #default="scope"><slot v-bind="scope" /></template>
  </parts.MenuItem>
</template>
