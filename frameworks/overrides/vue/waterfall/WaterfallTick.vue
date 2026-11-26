<script setup lang="ts">
import { computed, useAttrs, useSlots } from "vue"
import { WaterfallTick as Part } from "@ui-sdk/vue/waterfall"
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
const base = "absolute start-(--waterfall-tick) transition-[inset-inline-start] duration-[calc(560ms*var(--kf-speed,1))] ease-spring motion-reduce:transition-none! top-2 -translate-x-1/2 text-[10.5px] leading-none font-normal whitespace-nowrap tabular-nums first:translate-x-0 last:-translate-x-full"
</script>

<template>
  <Part v-bind="rest" :time="props.time" :class="cn(base, attrs.class as any)">
    <template v-for="n in names" :key="n" #[n]="s">
      <slot :name="n" v-bind="s ?? {}" />
    </template>
  </Part>
</template>
