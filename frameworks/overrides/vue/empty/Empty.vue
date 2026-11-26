<script setup lang="ts">
/* Animated empty state on UI SDK's core (src/components/primitives/empty.tsx) with the Keyframery look (src/components/ui/empty.tsx).
   Cascade: the media pops and its icon's strokes draw; then the title, the description and each action rise
   out of a light blur. Plays every time the empty state appears. The cascade scales with --kf-flourish;
   at 0 only the whole state's short fade remains. */
import { computed, useAttrs } from "vue"

import { Speed, type Speed as SpeedValue } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

import { parts } from "./parts"

defineOptions({ inheritAttrs: false })
const props = defineProps<{ speed?: SpeedValue; announce?: boolean }>()
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const base = "transition-opacity duration-[calc(240ms*var(--kf-speed,1))] ease-house data-starting-style:opacity-0 motion-reduce:transition-none flex min-w-0 flex-1 flex-col items-center justify-center gap-[var(--empty-gap,1.25rem)] rounded-[16px] p-[var(--empty-padding,2rem)] text-center text-balance"
</script>

<template>
  <Speed :speed="props.speed">
    <parts.Root :announce="props.announce" v-bind="forwarded" :class="cn(base, attrs.class as any)">
      <template v-for="(_, name) in $slots" #[name]="scope"><slot :name="name" v-bind="scope ?? {}" /></template>
    </parts.Root>
  </Speed>
</template>

<style>
@keyframes kf-empty-rise { from { opacity: 0; translate: 0 10px; filter: blur(6px) } }
@keyframes kf-empty-pop { from { opacity: 0; scale: 0.6; filter: blur(4px) } }
@keyframes kf-empty-draw { from { stroke-dasharray: 80; stroke-dashoffset: 80 } to { stroke-dasharray: 80; stroke-dashoffset: 0 } }
@media (prefers-reduced-motion: reduce) {
  @keyframes kf-empty-rise { from { opacity: 0 } }
  @keyframes kf-empty-pop { from { opacity: 0 } }
  @keyframes kf-empty-draw { from { opacity: 1 } }
}
</style>
