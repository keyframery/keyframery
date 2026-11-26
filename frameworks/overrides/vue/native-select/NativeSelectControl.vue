<script setup lang="ts">
/* The <select> itself. Its own text is transparent: the value part draws the label. */
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"
import { controlMotion, NativeSelectControlPart } from "./parts"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
</script>

<template>
  <NativeSelectControlPart v-bind="forwarded" :class="cn(controlMotion, attrs.class as any)"><slot /></NativeSelectControlPart>
</template>
