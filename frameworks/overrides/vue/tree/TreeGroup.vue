<script setup lang="ts">
import { computed, useAttrs, useSlots } from "vue"
import { TreeGroup as Part } from "@ui-sdk/vue/tree"
import { cn } from "@/lib/utils"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const rest = computed(() => {
  const { class: _class, ...r } = attrs
  return r
})
const slots = useSlots()
const names = computed(() => Object.keys(slots))
const base = "h-(--tree-group-height,auto) [clip-path:inset(-4px_-100vw)] transition-[height] duration-[calc(380ms*var(--kf-speed,1))] ease-house data-starting-style:h-0 data-ending-style:h-0 data-ending-style:duration-[calc(260ms*var(--kf-speed,1))] *:transition-[opacity,translate,filter] *:duration-[calc(420ms*var(--kf-speed,1))] *:ease-spring *:[transition-delay:calc(((min(sibling-index(),10)-1)*calc(36ms*var(--kf-speed,1))+calc(30ms*var(--kf-speed,1)))*var(--kf-flourish,1))] data-starting-style:*:translate-y-[calc(0.5rem*var(--kf-flourish,1))] data-starting-style:*:opacity-0 data-starting-style:*:blur-[calc(4px*var(--kf-flourish,1))] data-starting-style:*:transition-none data-ending-style:*:opacity-0 data-ending-style:*:blur-[calc(2px*var(--kf-flourish,1))] data-ending-style:*:duration-[calc(200ms*var(--kf-speed,1))] data-ending-style:*:ease-house data-ending-style:*:[transition-delay:0ms] motion-reduce:transition-none! motion-reduce:*:transition-none relative ml-[calc(var(--tree-indent,22px)-6.5px)] flex flex-col pl-[6.5px] before:absolute before:inset-y-1 before:left-0 before:w-px before:bg-[var(--tree-guide,var(--border))]"
</script>

<template>
  <Part v-bind="rest" :class="cn(base, attrs.class as any)">
    <template v-for="n in names" :key="n" #[n]="s">
      <slot :name="n" v-bind="s ?? {}" />
    </template>
  </Part>
</template>
