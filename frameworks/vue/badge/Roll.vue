<script setup lang="ts">
/* Roll: each digit is a column of 0 to 9 that slides to its value on a spring. Columns are keyed from the
   right, so a new leading digit rises in from below instead of every digit shifting. Exported for other numbers.
   The roll is flourish: at --kf-flourish 0 the new value is simply there. */
import { cn } from "@/lib/utils"

import { rollParts } from "./parts"

const props = defineProps<{ text: string; class?: string }>()

const digitClass =
  "flex flex-col transition-[translate] duration-[calc(520ms*var(--kf-speed,1)*var(--kf-flourish,1))] ease-spring [translate:0_calc(var(--d)*-1lh)] starting:[translate:0_1lh] motion-reduce:transition-none!"
/* The character at a place counted from the right, as the core's digit slot reads it. */
const charAt = (text: string, place: string) => text.charAt(text.length - Number(place)) || ""
const isDigit = (c: string) => /\d/.test(c)
</script>

<template>
  <rollParts.Root
    :text="props.text"
    :class="cn('inline-flex h-[1lh] overflow-hidden whitespace-pre tabular-nums [mask-image:linear-gradient(transparent,black_18%,black_82%,transparent)]', props.class)"
  >
    <template #default="{ state }">
      <rollParts.Digit
        v-for="place in state.places"
        :key="place"
        :value="place"
        :class="isDigit(charAt(state.text, place)) ? digitClass : undefined"
      >
        <template v-if="isDigit(charAt(state.text, place))"><span v-for="d in 10" :key="d" class="h-[1lh]">{{ d - 1 }}</span></template>
        <template v-else>{{ charAt(state.text, place) }}</template>
      </rollParts.Digit>
    </template>
  </rollParts.Root>
</template>
