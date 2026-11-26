<script setup lang="ts">
/* The button. With no content it shows the label, then a chevron that turns down as it opens. Your
   own content goes in the default slot, which receives the collapsible's `state`. */
import { computed, useAttrs } from "vue"
import { CollapsibleTrigger } from "@ui-sdk/vue/collapsible"

import { cn } from "@/lib/utils"
import ReasoningLabel from "./ReasoningLabel.vue"
import { chevronClass, triggerClass } from "./parts"

defineOptions({ inheritAttrs: false })
defineProps<{
  thinkingLabel?: string
  doneLabel?: (seconds: number | undefined) => string
}>()
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
</script>

<template>
  <CollapsibleTrigger v-bind="forwarded" :class="cn(triggerClass, attrs.class as any)">
    <template #default="scope">
      <slot v-bind="scope">
        <ReasoningLabel v-bind="{ ...(thinkingLabel !== undefined ? { thinkingLabel } : {}), ...(doneLabel ? { doneLabel } : {}) }" />
      </slot>
      <span data-slot="reasoning-chevron" aria-hidden="true" :class="chevronClass">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="size-3.5">
          <path d="m6 4 4 4-4 4" />
        </svg>
      </span>
    </template>
  </CollapsibleTrigger>
</template>
