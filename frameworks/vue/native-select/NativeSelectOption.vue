<script setup lang="ts">
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"
import { NativeSelectOptionPart, optionMotion } from "./parts"

defineOptions({ inheritAttrs: false })
defineProps<{ value: string }>()
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
</script>

<template>
  <NativeSelectOptionPart v-bind="forwarded" :value="value" :class="cn(optionMotion, attrs.class as any)"><slot /></NativeSelectOptionPart>
</template>
