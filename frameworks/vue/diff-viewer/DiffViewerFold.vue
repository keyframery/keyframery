<script setup lang="ts">
/* The button that opens a fold of unchanged lines. Disabled when its lines aren't known (a patch). */
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"

import { parts } from "./parts"

defineOptions({ inheritAttrs: false })
const props = defineProps<{ value: string }>()
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const base = cn(
  "transition-[color,background-color,scale] duration-[calc(160ms*var(--kf-speed,1))] ease-house active:scale-[calc(1-0.015*var(--kf-flourish,1))] motion-reduce:transition-none",
  "[&_svg]:transition-[translate,scale] [&_svg]:duration-[calc(260ms*var(--kf-speed,1))] [&_svg]:ease-pop hover:[&_svg]:scale-[calc(1+0.12*var(--kf-flourish,1))]",
)
</script>

<template>
  <parts.Fold :value="props.value" v-bind="forwarded" :class="cn(base, attrs.class as any)">
    <template #default="{ state }">
      <slot :state="state">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M5 5.5 8 2.5l3 3M5 10.5l3 3 3-3M8 2.5v4M8 13.5v-4" />
        </svg>
        <span>{{ state.lines }} <span data-slot="diff-viewer-fold-word">unchanged </span>{{ state.lines === 1 ? "line" : "lines" }}</span>
      </slot>
    </template>
  </parts.Fold>
</template>
