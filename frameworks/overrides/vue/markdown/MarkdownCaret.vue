<script setup lang="ts">
/* The caret pulses softly while the text arrives. It is the "still writing" signal, so it keeps
   pulsing at any flourish; reduced motion holds it still. */
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"
import { caretMotion, parts } from "./parts"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
</script>

<template>
  <parts.Caret v-bind="forwarded" :class="cn(caretMotion, attrs.class as any)" />
</template>
