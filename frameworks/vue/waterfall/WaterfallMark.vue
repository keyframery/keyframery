<script setup lang="ts">
import { computed, useAttrs, useSlots } from "vue"
import { WaterfallMark as Part } from "@ui-sdk/vue/waterfall"
import { cn } from "@/lib/utils"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const props = defineProps<{ time: number }>()
const rest = computed(() => {
  const { class: _class, ...r } = attrs
  return r
})
const slots = useSlots()
const names = computed(() => Object.keys(slots))
const base = "absolute start-(--waterfall-mark) transition-[inset-inline-start,opacity] duration-[calc(560ms*var(--kf-speed,1))] ease-spring data-outside:opacity-0 animate-[kf-waterfall-mark_calc(520ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-house)_calc(240ms*var(--kf-speed,1)*var(--kf-flourish,1))_backwards] motion-reduce:animate-none! motion-reduce:transition-none! pointer-events-none bottom-1.5 z-10 -translate-x-1/2 rounded-full bg-[color-mix(in_oklab,var(--waterfall-marker-color,var(--ring))_12%,transparent)] px-1.5 py-[3px] text-[10.5px] leading-none font-medium whitespace-nowrap text-[color:var(--waterfall-marker-color,var(--ring))] after:absolute after:top-full after:left-1/2 after:h-[999px] after:w-px after:bg-[color-mix(in_oklab,var(--waterfall-marker-color,var(--ring))_50%,transparent)] after:content-['']"
</script>

<template>
  <Part v-bind="rest" :time="props.time" :class="cn(base, attrs.class as any)">
    <template v-for="n in names" :key="n" #[n]="s">
      <slot :name="n" v-bind="s ?? {}" />
    </template>
  </Part>
</template>
