<script setup lang="ts">
import { computed, useAttrs, useSlots } from "vue"
import { PaginationItem as Part } from "@ui-sdk/vue/pagination"
import { cn } from "@/lib/utils"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const rest = computed(() => {
  const { class: _class, ...r } = attrs
  return r
})
const slots = useSlots()
const names = computed(() => Object.keys(slots))
const base = "transition-[opacity,scale,filter] duration-[calc(300ms*var(--kf-speed,1)*var(--kf-flourish,1))] ease-spring starting:scale-75 starting:opacity-0 starting:blur-[3px] motion-reduce:transition-none! flex"
</script>

<template>
  <Part v-bind="rest" :class="cn(base, attrs.class as any)">
    <template v-for="n in names" :key="n" #[n]="s">
      <slot :name="n" v-bind="s ?? {}" />
    </template>
  </Part>
</template>
