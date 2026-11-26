<script setup lang="ts">
import { ComboboxSeparator } from "@ui-sdk/vue/combobox"
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
</script>

<template>
  <ComboboxSeparator v-bind="forwarded" :class="cn('-mx-1.5 my-1.5 h-px bg-border', attrs.class as any)" />
</template>
