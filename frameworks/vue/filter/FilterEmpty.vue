<script setup lang="ts">
/* What the list says when nothing matches. */
import { ComboboxEmpty } from "@ui-sdk/vue/combobox"
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
  <ComboboxEmpty v-bind="forwarded" :class="cn('hidden px-3 py-6 text-center text-[13px] text-muted-foreground data-empty:block', attrs.class as any)">
    <template #default="scope"><slot v-bind="scope ?? {}" /></template>
  </ComboboxEmpty>
</template>
