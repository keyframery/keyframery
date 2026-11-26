<script setup lang="ts">
import { computed, useAttrs, useSlots } from "vue"
import { WaterfallBar as Part } from "@ui-sdk/vue/waterfall"
import { cn } from "@/lib/utils"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const rest = computed(() => {
  const { class: _class, ...r } = attrs
  return r
})
const slots = useSlots()
const names = computed(() => Object.keys(slots))
const base = "relative before:absolute before:start-(--waterfall-start) before:w-(--waterfall-size) before:min-w-0.5 before:content-[''] before:origin-left rtl:before:origin-right before:animate-[kf-waterfall-bar_calc(620ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-spring)_backwards] before:[animation-delay:calc(var(--kf-wf-delay,0ms)+calc(90ms*var(--kf-speed,1)*var(--kf-flourish,1)))] before:transition-[inset-inline-start,width] before:duration-[calc(560ms*var(--kf-speed,1))] before:ease-spring motion-reduce:before:animate-none! motion-reduce:before:transition-none! h-full before:inset-y-[10px] before:rounded-[3px] before:bg-[color-mix(in_oklab,var(--waterfall-bar,var(--primary))_75%,transparent)] data-[level=2]:before:bg-[color-mix(in_oklab,var(--waterfall-muted,var(--muted-foreground))_40%,transparent)] data-[level=3]:before:bg-[color-mix(in_oklab,var(--waterfall-muted,var(--muted-foreground))_30%,transparent)] data-selected:before:bg-[var(--waterfall-marker-color,var(--ring))] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
</script>

<template>
  <Part v-bind="rest" :class="cn(base, attrs.class as any)">
    <template v-for="n in names" :key="n" #[n]="s">
      <slot :name="n" v-bind="s ?? {}" />
    </template>
  </Part>
</template>
