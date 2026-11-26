<script setup lang="ts">
/* Direction: the new weeks come 28px from the side the months turned to, blurred, on a spring.
   At --kf-flourish 0 they come 8px with no blur: the side still says which way the months went. */
import { computed, useAttrs, useSlots } from "vue"
import { CalendarWeeks as Part } from "@ui-sdk/vue/calendar"
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
const base = "transition-[opacity,filter,translate] duration-[calc(460ms*var(--kf-speed,1))] ease-spring starting:opacity-0 starting:blur-[calc(6px*var(--kf-flourish,1))] group-data-[direction=none]/calendar:starting:opacity-100 group-data-[direction=none]/calendar:starting:blur-none group-data-[direction=next]/calendar:starting:translate-x-[calc(8px+20px*var(--kf-flourish,1))] group-data-[direction=previous]/calendar:starting:-translate-x-[calc(8px+20px*var(--kf-flourish,1))] motion-reduce:transition-none!"
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
