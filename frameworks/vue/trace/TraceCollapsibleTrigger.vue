<script setup lang="ts">
/* The button around a line. A chevron after the line turns down on a spring as the row opens. */
import { computed, useAttrs } from "vue"
import { CollapsibleTrigger } from "@ui-sdk/vue/collapsible"

import { cn } from "@/lib/utils"
import { traceTriggerClass } from "./parts"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
</script>

<template>
  <CollapsibleTrigger v-bind="forwarded" :class="cn(traceTriggerClass, attrs.class as any)">
    <template #default="scope">
      <slot v-bind="scope" />
      <span
        data-slot="trace-chevron"
        aria-hidden="true"
        class="inline-grid shrink-0 place-items-center transition-[rotate] duration-[calc(460ms*var(--kf-speed,1))] ease-spring group-data-open/trace-trigger:rotate-90 rtl:-scale-x-100 motion-reduce:transition-none!"
      >
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="size-3.5">
          <path d="m6 4 4 4-4 4" />
        </svg>
      </span>
    </template>
  </CollapsibleTrigger>
</template>
