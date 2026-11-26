<script setup lang="ts">
/* The bars, for type="bar". */
import { useAttrs } from "vue"

import { cn } from "@/lib/utils"
import SparklineBar from "./SparklineBar.vue"

defineOptions({ inheritAttrs: false })
defineProps<{ count: number }>()
const attrs = useAttrs()
</script>

<template>
  <div aria-hidden="true" v-bind="attrs" :class="cn('pointer-events-none absolute inset-0', attrs.class as any)" :style="[{ '--sparkline-n': Math.max(1, count) }, attrs.style as any]">
    <SparklineBar v-for="i in count" :key="i - 1" :value="String(i - 1)" />
  </div>
</template>
