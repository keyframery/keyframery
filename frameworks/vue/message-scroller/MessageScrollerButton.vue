<script setup lang="ts">
/* Jump to latest: UI SDK's scroll-to-end button, as a small key centred over the bottom edge. It
   rises with a pop once the reader scrolls away and takes the primary colour while new messages wait. */
import { computed, useAttrs } from "vue"
import { ScrollAreaScrollToEnd } from "@ui-sdk/vue/scroll-area"

import { cn } from "@/lib/utils"
import MessageScrollerLabel from "./MessageScrollerLabel.vue"
import { buttonClass } from "./parts"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
</script>

<template>
  <ScrollAreaScrollToEnd v-bind="forwarded" :class="cn(buttonClass, attrs.class as any)">
    <template #default="scope">
      <slot v-bind="scope">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M8 3v10M3.75 8.75 8 13l4.25-4.25" />
        </svg>
        <MessageScrollerLabel />
      </slot>
    </template>
  </ScrollAreaScrollToEnd>
</template>
