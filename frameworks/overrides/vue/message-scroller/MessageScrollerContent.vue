<script setup lang="ts">
/* The conversation's column: messages stack from the bottom. */
import { computed, useAttrs } from "vue"

import { ScrollAreaContent } from "@/components/keyframery/scroll-area"
import { cn } from "@/lib/utils"
import { contentClass } from "./parts"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
</script>

<template>
  <ScrollAreaContent v-bind="forwarded" :class="cn(contentClass, attrs.class as any)"><slot /></ScrollAreaContent>
</template>
