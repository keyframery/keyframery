<script setup lang="ts">
/* Animated spinner: `ring` (an arc that turns and stretches) or `spokes` (eight spokes fading round),
   in currentColor. It pops in when it appears and keeps turning while it is there. */
import { computed, useAttrs } from "vue"

import type { SpinnerVariant } from "@/components/keyframery/core/spinner-core"
import { type Speed, useSpeed } from "@/lib/keyframery"
import { cn } from "@/lib/utils"
import { SpinnerRoot, type SpinnerSize, spinnerLook, spinnerMotion, spinnerSizes } from "./parts"

defineOptions({ inheritAttrs: false })
const props = withDefaults(
  defineProps<{
    /** What a screen reader hears. Defaults to "Loading". */
    label?: string
    /** `"ring"` (the default) or `"spokes"`. */
    variant?: SpinnerVariant
    /** `"sm"` (14px), `"md"` (16px, the default) or `"lg"` (24px). */
    size?: SpinnerSize
    speed?: Speed
  }>(),
  { variant: "ring", size: "md" },
)
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs
  return rest
})
const speedStyle = useSpeed(() => props.speed)
const style = computed(() => [speedStyle.value, attrs.style as any])
const spokes = Array.from({ length: 8 }, (_, i) => i)
</script>

<template>
  <SpinnerRoot
    v-bind="forwarded"
    :label="label"
    :variant="variant"
    :style="style"
    :class="cn(spinnerMotion, spinnerSizes[size], spinnerLook, attrs.class as any)"
  >
    <template #default="scope">
      <slot v-bind="scope">
        <svg v-if="variant === 'spokes'" viewBox="0 0 24 24" fill="none" aria-hidden="true" class="size-full">
          <!-- Each spoke starts its fade one eighth of a turn after the last: the brightest one walks round. -->
          <line
            v-for="i in spokes"
            :key="i"
            x1="12"
            y1="3"
            x2="12"
            y2="7.5"
            stroke="currentColor"
            stroke-width="2.25"
            stroke-linecap="round"
            :transform="`rotate(${i * 45} 12 12)`"
            :style="{ '--kf-i': i, opacity: 1 - i * 0.1 }"
            class="animate-[kf-spinner-spoke_calc(800ms*var(--kf-speed,1))_linear_infinite] [animation-delay:calc((var(--kf-i)-8)*100ms*var(--kf-speed,1))] motion-reduce:animate-none"
          />
        </svg>
        <svg
          v-else
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          class="size-full animate-[kf-spinner-turn_calc(780ms*var(--kf-speed,1))_linear_infinite] motion-reduce:animate-none"
        >
          <circle cx="12" cy="12" r="9.5" stroke="currentColor" stroke-width="2.5" opacity="0.16" />
          <circle
            cx="12"
            cy="12"
            r="9.5"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            pathLength="100"
            class="origin-center -rotate-90 [stroke-dasharray:72_100] animate-[kf-spinner-arc_calc(1500ms*var(--kf-speed,1))_var(--ease-house)_infinite] motion-reduce:animate-none"
          />
        </svg>
      </slot>
    </template>
  </SpinnerRoot>
</template>

<style>
/* kf-spinner: the keyframes this part animates with (React's <style href="kf-spinner">), shipped with the component. */
@keyframes kf-spinner-in{from{opacity:0;scale:0.4;filter:blur(2px)}}@keyframes kf-spinner-turn{to{rotate:360deg}}@keyframes kf-spinner-arc{0%{stroke-dasharray:6 100;stroke-dashoffset:0}50%{stroke-dasharray:62 100;stroke-dashoffset:-14}100%{stroke-dasharray:6 100;stroke-dashoffset:-94}}@keyframes kf-spinner-spoke{from{opacity:1}to{opacity:0.16}}@media (prefers-reduced-motion:reduce){@keyframes kf-spinner-in{from{opacity:0}}}
</style>
