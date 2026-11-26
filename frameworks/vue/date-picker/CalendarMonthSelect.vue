<script setup lang="ts">
import { computed, useAttrs, useSlots } from "vue"
import { CalendarMonthSelect as Part } from "@ui-sdk/vue/date-picker"
import { cn } from "@/lib/utils"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const rest = computed(() => {
  const { class: _class, ...r } = attrs
  return r
})
const slots = useSlots()
const names = computed(() => Object.keys(slots))
const base = "h-7 cursor-pointer appearance-none rounded-[8px] bg-[var(--date-picker-face,var(--background))] px-2 text-[13px] font-medium text-[color:var(--date-picker-ink,var(--foreground))] outline-none shadow-[0_0_0_1px_rgb(0_0_0/0.09),0_1px_2px_rgb(0_0_0/0.05)] hover:shadow-[0_0_0_1px_rgb(0_0_0/0.16),0_1px_2px_rgb(0_0_0/0.05)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.1)] dark:hover:shadow-[0_0_0_1px_rgb(255_255_255/0.16)] transition-shadow duration-[calc(150ms*var(--kf-speed,1))] focus-visible:shadow-[0_0_0_1px_var(--ring)] focus-visible:ring-[3px] focus-visible:ring-ring/25 dark:focus-visible:shadow-[0_0_0_1px_var(--ring)] data-disabled:pointer-events-none data-disabled:opacity-40 motion-reduce:transition-none!"
</script>

<template>
  <Part v-bind="rest" :class="cn(base, attrs.class as any)">
    <template v-for="n in names" :key="n" #[n]="s">
      <slot :name="n" v-bind="s ?? {}" />
    </template>
  </Part>
</template>
