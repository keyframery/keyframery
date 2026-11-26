<script setup lang="ts">
/* The body: opens to its real height under a hairline, its sections rising in one after another. */
import { computed, useAttrs } from "vue"
import { CollapsiblePanel } from "@ui-sdk/vue/collapsible"

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
  <CollapsiblePanel v-bind="forwarded" :class="cn(contentClass, attrs.class as any)">
    <template #default="scope"><slot v-bind="scope" /></template>
  </CollapsiblePanel>
</template>
