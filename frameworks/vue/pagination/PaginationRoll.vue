<script setup lang="ts">
/* Roll: each digit is a column of 0 to 9 that slides to its value on a spring. Screen readers read the
   plain number. The roll scales with --kf-flourish; at 0 the number just changes. */
import { computed, useAttrs } from "vue"
import { cn } from "@/lib/utils"

defineOptions({ inheritAttrs: false })
const props = defineProps<{ value: number }>()
const attrs = useAttrs()
const digits = computed(() => String(Math.max(0, Math.round(props.value))).split(""))
</script>

<template>
  <span v-bind="attrs" data-slot="pagination-roll" :class="cn('relative inline-flex tabular-nums', attrs.class as any)">
    <span class="sr-only">{{ props.value }}</span>
    <span aria-hidden="true" class="inline-flex h-[1lh] overflow-hidden">
      <span v-for="(digit, index) in digits" :key="digits.length - index" :style="{ '--d': Number(digit) }"
        class="flex flex-col transition-[translate] duration-[calc(500ms*var(--kf-speed,1)*var(--kf-flourish,1))] ease-spring [translate:0_calc(var(--d)*-1lh)] motion-reduce:transition-none!">
        <span v-for="d in 10" :key="d - 1" class="h-[1lh]">{{ d - 1 }}</span>
      </span>
    </span>
  </span>
</template>
