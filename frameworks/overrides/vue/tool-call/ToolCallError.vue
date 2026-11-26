<script setup lang="ts">
/* Why the call failed, in a destructive tint. */
import { useAttrs } from "vue"

import { cn } from "@/lib/utils"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
</script>

<template>
  <p
    data-slot="tool-call-error"
    v-bind="{ ...attrs, class: undefined }"
    :class="
      cn(
        'rounded-[10px] px-3 py-2 text-[12.5px] leading-relaxed text-[color:var(--tool-call-error,var(--destructive))]',
        'bg-[color-mix(in_oklab,var(--tool-call-error,var(--destructive))_7%,transparent)] dark:bg-[color-mix(in_oklab,var(--tool-call-error,var(--destructive))_12%,transparent)]',
        attrs.class as any,
      )
    "
  >
    <slot />
  </p>
</template>
