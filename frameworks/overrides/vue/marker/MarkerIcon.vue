<script setup lang="ts">
/* The icon repeats what the words say, so it is hidden from screen readers. Pops in when done. */
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"
import { iconLook, iconMotion, MarkerIconPart } from "./parts"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
</script>

<template>
  <MarkerIconPart v-bind="forwarded" :class="cn(iconMotion, iconLook, attrs.class as any)">
    <template #default="scope"><slot v-bind="scope" /></template>
  </MarkerIconPart>
</template>
