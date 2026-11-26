<script setup lang="ts">
/* The bottom of the sidebar. */
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"
import { footerClass, parts } from "./parts"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
</script>

<template>
  <parts.Footer v-bind="forwarded" :class="cn(footerClass, attrs.class as any)">
    <template #default="scope"><slot v-bind="scope" /></template>
  </parts.Footer>
</template>
