<script setup lang="ts">
/* Direction: the new weeks come 28px from the side the months turned to, blurred, on a spring.
   The slide and blur scale with --kf-flourish; the fade stays. */
import { computed, useAttrs, useSlots } from "vue"
import { CalendarWeeks as Part } from "@ui-sdk/vue/date-picker"
import { cn } from "@/lib/utils"
import CalendarDay from "./CalendarDay.vue"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const slots = useSlots()
const rest = computed(() => {
  const { class: _class, ...r } = attrs
  return r
})
const names = computed(() => Object.keys(slots).filter((n) => n !== "default"))
const base = "transition-[opacity,filter,translate] duration-[calc(460ms*var(--kf-speed,1))] ease-spring starting:opacity-0 starting:blur-[calc(6px*var(--kf-flourish,1))] group-data-[direction=none]/picker-content:starting:opacity-100 group-data-[direction=none]/picker-content:starting:blur-none group-data-[direction=next]/picker-content:starting:translate-x-[calc(1.75rem*var(--kf-flourish,1))] group-data-[direction=previous]/picker-content:starting:-translate-x-[calc(1.75rem*var(--kf-flourish,1))] motion-reduce:transition-none!"
</script>

<template>
  <Part v-bind="rest" :class="cn(base, attrs.class as any)">
    <template #default="s">
      <slot v-bind="s ?? {}">
        <CalendarDay :value="s.cell.date" />
      </slot>
    </template>
    <template v-for="n in names" :key="n" #[n]="s">
      <slot :name="n" v-bind="s ?? {}" />
    </template>
  </Part>
</template>
