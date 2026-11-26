<script setup lang="ts">
/* The header row: a full-width button that opens the body, with a chevron at the end that turns as it opens. */
import { computed, useAttrs } from "vue"
import { CollapsibleTrigger } from "@ui-sdk/vue/collapsible"

import { cn } from "@/lib/utils"
import { triggerClass } from "./parts"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
</script>

<template>
  <CollapsibleTrigger v-bind="forwarded" :class="cn(triggerClass, attrs.class as any)">
    <template #default="scope">
      <slot v-bind="scope" />
      <span
        data-slot="tool-call-chevron"
        aria-hidden="true"
        class="inline-grid shrink-0 place-items-center transition-[rotate] duration-[calc(420ms*var(--kf-speed,1))] ease-spring group-data-open/tool-call-trigger:rotate-180 motion-reduce:transition-none!"
      >
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="size-3.5">
          <path d="m4 6 4 4 4-4" />
        </svg>
      </span>
    </template>
  </CollapsibleTrigger>
</template>
