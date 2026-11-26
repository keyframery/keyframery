<script setup lang="ts">
/* A list of pages. */
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"
import { menuClass, parts } from "./parts"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
</script>

<template>
  <parts.Menu v-bind="forwarded" :class="cn(menuClass, attrs.class as any)">
    <template #default="scope"><slot v-bind="scope" /></template>
  </parts.Menu>
</template>
