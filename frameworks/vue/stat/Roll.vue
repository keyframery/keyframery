<script setup lang="ts">
/* Roll: every digit is a column of 0 to 9 that slides to its value on a spring; other characters
   stay put. Positions are keyed from the right, so a new leading digit is added instead of
   everything shifting. Screen readers get the plain text. The roll scales with --kf-flourish: at 0
   the digits change in place. */
import { computed } from "vue"

import { cn } from "@/lib/utils"

const props = defineProps<{ text: string; class?: string }>()
const chars = computed(() => props.text.split("").map((c, i, all) => ({ c, key: all.length - i, digit: /\d/.test(c) })))
const digits = Array.from({ length: 10 }, (_, d) => d)
</script>

<template>
  <span class="sr-only">{{ text }}</span>
  <span data-roll="" aria-hidden="true" :class="cn('inline-flex h-[1lh] overflow-hidden whitespace-pre tabular-nums', props.class)">
    <template v-for="ch in chars" :key="ch.key">
      <span
        v-if="ch.digit"
        :style="{ '--d': Number(ch.c), '--k': ch.key }"
        class="flex flex-col transition-[translate] duration-[calc(560ms*var(--kf-speed,1)*var(--kf-flourish,1))] ease-spring [transition-delay:calc(min(var(--k),8)*calc(18ms*var(--kf-speed,1))*var(--kf-flourish,1))] [translate:0_calc(var(--d)*-1lh)] motion-reduce:transition-none!"
      >
        <span v-for="d in digits" :key="d" class="h-[1lh]">{{ d }}</span>
      </span>
      <span v-else>{{ ch.c }}</span>
    </template>
  </span>
</template>
