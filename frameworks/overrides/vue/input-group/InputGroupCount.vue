<script setup lang="ts">
/* How many characters the control holds (show="used", the default) or has left under its maxLength
   (show="left"). With maxLength set it shows "12/280" and is marked near the limit. Its digits roll. */
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"

import { parts } from "./parts"

defineOptions({ inheritAttrs: false })
const props = defineProps<{ show?: "used" | "left" }>()
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const base = cn(
  "inline-flex items-center tabular-nums",
  "text-[12px] leading-4 text-[color:var(--input-group-muted,var(--muted-foreground))]",
  "[transition:color_calc(150ms*var(--kf-speed,1))_var(--ease-house)] data-near-limit:text-destructive motion-reduce:[transition:none]",
)
/* Digits keyed from the right, so the ones column stays put when a tens column arrives. */
const digitsOf = (value: number) => String(Math.max(0, value)).split("")
</script>

<template>
  <parts.Count :show="props.show" v-bind="forwarded" :class="cn(base, attrs.class as any)">
    <template #default="{ state }">
      <slot :state="state">
        <span class="inline-flex h-[1lh] overflow-hidden tabular-nums" aria-hidden="true">
          <span
            v-for="(digit, index) in digitsOf(state.value)"
            :key="digitsOf(state.value).length - index"
            :style="{ '--d': Number(digit) }"
            class="flex flex-col [translate:0_calc(var(--d)*-1lh)] [transition:translate_calc(500ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-spring)] motion-reduce:[transition:none]! starting:opacity-0"
          >
            <span v-for="d in 10" :key="d" class="h-[1lh]">{{ d - 1 }}</span>
          </span>
        </span>
        <span v-if="state.max && props.show !== 'left'" aria-hidden="true">/{{ state.max }}</span>
        <span class="sr-only">{{ props.show === "left" ? `${state.value} characters left` : `${state.length} characters${state.max ? ` of ${state.max}` : ""}` }}</span>
      </slot>
    </template>
  </parts.Count>
</template>
