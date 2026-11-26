<script setup lang="ts">
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"
import { NativeSelectOptGroupPart, optionMotion } from "./parts"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
</script>

<template>
  <NativeSelectOptGroupPart v-bind="forwarded" :class="cn(optionMotion, attrs.class as any)"><slot /></NativeSelectOptGroupPart>
</template>
