<script setup lang="ts">
/* The row above the grid. The heading sits first, the month keys after it. */
import { useAttrs } from "vue"
import { cn } from "@/lib/utils"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
</script>

<template>
  <div v-bind="attrs" data-slot="calendar-header" :class="cn('flex h-7 items-center gap-1.5', attrs.class as any)">
    <slot />
  </div>
</template>
