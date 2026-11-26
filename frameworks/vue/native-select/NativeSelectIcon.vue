<script setup lang="ts">
/* The chevron. With no content it draws the house chevron. */
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"
import { iconMotion, NativeSelectIconPart } from "./parts"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
</script>

<template>
  <NativeSelectIconPart v-bind="forwarded" :class="cn(iconMotion, attrs.class as any)">
    <template #default="scope">
      <slot v-bind="scope">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="m4.5 6.25 3.5 3.5 3.5-3.5" />
        </svg>
      </slot>
    </template>
  </NativeSelectIconPart>
</template>
