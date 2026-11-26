<script setup lang="ts">
/* Animated reading direction on UI SDK's core (src/components/primitives/direction.tsx, src/components/ui/direction.tsx).
   An element with `dir` (and `lang`); everything inside reads the direction from the page. When the direction flips,
   the content inside comes in from the side it now reads from, out of a soft blur, one block after another. It never
   plays on first load, and scales with --kf-flourish. `dir` / `v-model:dir` / `default-dir`, `@dir-change`. */
import { computed, useAttrs } from "vue"

import type { Dir } from "@/components/keyframery/core/direction-core"
import { Speed, type Speed as SpeedValue } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

import { parts } from "./parts"

defineOptions({ inheritAttrs: false })
const props = defineProps<{ dir?: Dir; defaultDir?: Dir; lang?: string; speed?: SpeedValue }>()
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const base = cn(
  "data-flipped:data-[dir=rtl]:[&>*]:animate-[kf-dir-rtl_calc(460ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-spring)_calc((min(sibling-index(),8)-1)*40ms*var(--kf-speed,1)*var(--kf-flourish,1))_backwards]",
  "data-flipped:data-[dir=ltr]:[&>*]:animate-[kf-dir-ltr_calc(460ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-spring)_calc((min(sibling-index(),8)-1)*40ms*var(--kf-speed,1)*var(--kf-flourish,1))_backwards]",
  "motion-reduce:[&>*]:animate-none!",
)
</script>

<template>
  <Speed :speed="props.speed">
    <parts.Root :dir="props.dir" :default-dir="props.defaultDir" :lang="props.lang" v-bind="forwarded" :class="cn(base, attrs.class as any)">
      <template v-for="(_, name) in $slots" #[name]="scope"><slot :name="name" v-bind="scope ?? {}" /></template>
    </parts.Root>
  </Speed>
</template>

<style>
/* Two names, so switching direction switches animation and restarts it. */
@keyframes kf-dir-rtl { from { opacity: 0; translate: 28px 0; filter: blur(6px) } }
@keyframes kf-dir-ltr { from { opacity: 0; translate: -28px 0; filter: blur(6px) } }
</style>
