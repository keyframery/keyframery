<script setup lang="ts">
/* Stands for pages left out of a long trail. It's a picture: put it in a menu trigger with a name. */
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"

import { parts } from "./parts"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const base = "flex size-6 items-center justify-center [&>svg]:size-4"
</script>

<template>
  <parts.Ellipsis v-bind="forwarded" :class="cn(base, attrs.class as any)">
    <template #default="scope">
      <slot v-bind="scope ?? {}">
        <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <circle cx="3.5" cy="8" r="1.15" />
          <circle cx="8" cy="8" r="1.15" />
          <circle cx="12.5" cy="8" r="1.15" />
        </svg>
      </slot>
    </template>
  </parts.Ellipsis>
</template>
