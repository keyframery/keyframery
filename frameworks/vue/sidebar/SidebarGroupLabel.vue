<script setup lang="ts">
/* A group's label. It folds to nothing on the rail; in a collapsible group it is the trigger, with
   a chevron that turns as the group opens. */
import { computed, inject, useAttrs } from "vue"
import { CollapsibleTrigger } from "@ui-sdk/vue/collapsible"

import { cn } from "@/lib/utils"
import { groupKey, groupLabelMotion, groupTriggerClass, labelLook, parts } from "./parts"

defineOptions({ inheritAttrs: false })
const collapsible = inject(groupKey, () => false)
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
</script>

<template>
  <parts.GroupLabel v-if="collapsible()" v-bind="forwarded" :class="cn(groupLabelMotion, attrs.class as any)">
    <template #default="scope">
      <CollapsibleTrigger :class="groupTriggerClass">
        <slot v-bind="scope" />
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="size-3 -rotate-90 transition-[rotate] duration-[calc(480ms*var(--kf-speed,1))] ease-spring group-data-open/sidebar-group:rotate-0 motion-reduce:transition-none!"
        >
          <path d="m4 6 4 4 4-4" />
        </svg>
      </CollapsibleTrigger>
    </template>
  </parts.GroupLabel>
  <parts.GroupLabel v-else v-bind="forwarded" :class="cn(groupLabelMotion, labelLook, attrs.class as any)">
    <template #default="scope"><slot v-bind="scope" /></template>
  </parts.GroupLabel>
</template>
