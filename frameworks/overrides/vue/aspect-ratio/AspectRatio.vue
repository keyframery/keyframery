<script setup lang="ts">
/* Animated aspect ratio on UI SDK's core (src/components/primitives/aspect-ratio.tsx) with the Keyframery look (src/components/ui/aspect-ratio.tsx).
   A new ratio is reached on a spring: the frame reshapes instead of snapping. The frame is a soft well with a
   hairline drawn inside it, and it rounds and clips whatever it holds. */
import { computed, useAttrs } from "vue"

import { Speed, type Speed as SpeedValue } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

import { parts } from "./parts"

defineOptions({ inheritAttrs: false })
const props = defineProps<{ speed?: SpeedValue; ratio?: number }>()
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const base = "relative transition-[aspect-ratio] duration-[calc(620ms*var(--kf-speed,1))] ease-spring motion-reduce:transition-none w-full overflow-hidden rounded-[var(--aspect-ratio-radius,14px)] bg-[var(--aspect-ratio-face,var(--muted))] after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:shadow-[inset_0_0_0_1px_rgb(0_0_0/0.07)] dark:after:shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08)]"
</script>

<template>
  <Speed :speed="props.speed">
    <parts.Root :ratio="props.ratio" v-bind="forwarded" :class="cn(base, attrs.class as any)">
      <template v-for="(_, name) in $slots" #[name]="scope"><slot :name="name" v-bind="scope ?? {}" /></template>
    </parts.Root>
  </Speed>
</template>
