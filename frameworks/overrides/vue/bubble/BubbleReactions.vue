<script setup lang="ts">
/* A small key on the bubble's edge (side top|bottom, align start|end), ringed in the page colour so it cuts out of the bubble; it pops in a beat after its bubble. */
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"

import { parts } from "./parts"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const base = "data-[side=bottom]:origin-top data-[side=top]:origin-bottom transition-[scale,opacity,filter] duration-[calc(480ms*var(--kf-speed,1))] ease-pop delay-[calc(260ms*var(--kf-speed,1)*var(--kf-flourish,1))] data-starting-style:scale-[calc(0.95-0.55*var(--kf-flourish,1))] data-starting-style:opacity-0 data-starting-style:blur-[calc(3px*var(--kf-flourish,1))] data-starting-style:transition-none motion-reduce:transition-none! absolute z-10 flex h-6 w-fit shrink-0 items-center justify-center gap-1 rounded-full bg-background px-1.5 text-[12px] leading-none tabular-nums shadow-[0_0_0_2px_var(--bubble-cutout,var(--background)),0_0_0_3px_rgb(0_0_0/0.06),0_2px_5px_-1px_rgb(0_0_0/0.12)] dark:bg-accent dark:shadow-[0_0_0_2px_var(--bubble-cutout,var(--background)),0_0_0_3px_rgb(255_255_255/0.07),0_2px_6px_-1px_rgb(0_0_0/0.6)] data-[side=bottom]:bottom-0 data-[side=bottom]:translate-y-2/3 data-[side=top]:top-0 data-[side=top]:-translate-y-2/3 data-[align=end]:end-2 data-[align=start]:start-2 has-[button]:p-0"
</script>

<template>
  <parts.Reactions v-bind="forwarded" :class="cn(base, attrs.class as any)">
    <template v-for="(_, name) in $slots" #[name]="scope"><slot :name="name" v-bind="scope ?? {}" /></template>
  </parts.Reactions>
</template>
