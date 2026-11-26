<script setup lang="ts">
/* One month. Its rows are keyed by the month, so a new month arrives as new rows. The grid draws the
   chosen day's key as `before:` (the date or a range's start) and `after:` (a range's end), placed with
   CSS anchors, and glides it between days on a spring. */
import { computed, inject, useAttrs, useSlots } from "vue"
import { CalendarGrid as Part } from "@ui-sdk/vue/date-picker"
import { cn } from "@/lib/utils"
import { pickerKey } from "./context"
import CalendarWeekdays from "./CalendarWeekdays.vue"
import CalendarWeeks from "./CalendarWeeks.vue"

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{ offset?: number }>(), { offset: 0 })
const attrs = useAttrs()
const slots = useSlots()
const rest = computed(() => {
  const { class: _class, ...r } = attrs
  return r
})
const names = computed(() => Object.keys(slots).filter((n) => n !== "default"))
const shown = inject(pickerKey, null)?.shown ?? null
/* Read while the grid renders, like React's ref: the month this grid shows. */
function record(month: string) {
  if (shown && props.offset === 0) shown.current = month
  return [month]
}
const base = "relative isolate [anchor-scope:--kf-day-a,--kf-day-b] before:pointer-events-none before:absolute before:-z-10 before:opacity-0 before:content-[''] before:[position-anchor:--kf-day-a] before:top-[anchor(top)] before:right-[anchor(right)] before:bottom-[anchor(bottom)] before:left-[anchor(left)] before:[transition:top_calc(300ms*var(--kf-speed,1))_var(--ease-spring),right_calc(300ms*var(--kf-speed,1))_var(--ease-spring),bottom_calc(300ms*var(--kf-speed,1))_var(--ease-spring),left_calc(300ms*var(--kf-speed,1))_var(--ease-spring),opacity_calc(220ms*var(--kf-speed,1))_var(--ease-house)_calc(180ms*var(--kf-speed,1)*var(--kf-flourish,1))] motion-reduce:before:[transition:none]! after:pointer-events-none after:absolute after:-z-10 after:opacity-0 after:content-[''] after:[position-anchor:--kf-day-b] after:top-[anchor(top)] after:right-[anchor(right)] after:bottom-[anchor(bottom)] after:left-[anchor(left)] after:[transition:top_calc(300ms*var(--kf-speed,1))_var(--ease-spring),right_calc(300ms*var(--kf-speed,1))_var(--ease-spring),bottom_calc(300ms*var(--kf-speed,1))_var(--ease-spring),left_calc(300ms*var(--kf-speed,1))_var(--ease-spring),opacity_calc(220ms*var(--kf-speed,1))_var(--ease-house)_calc(180ms*var(--kf-speed,1)*var(--kf-flourish,1))] motion-reduce:after:[transition:none]! has-[[data-slot=calendar-day][data-selected]:not([data-range-middle]),[data-slot=calendar-day][data-range-start]]:before:opacity-100 has-[[data-slot=calendar-day][data-range-end]]:after:opacity-100 border-separate border-spacing-x-0 border-spacing-y-0.5 data-disabled:opacity-50 before:rounded-[9px] before:bg-[var(--date-picker-accent,var(--primary))] after:rounded-[9px] after:bg-[var(--date-picker-accent,var(--primary))] before:shadow-[inset_0_1px_0_rgb(255_255_255/0.14),0_1px_2px_rgb(0_0_0/0.25)] after:shadow-[inset_0_1px_0_rgb(255_255_255/0.14),0_1px_2px_rgb(0_0_0/0.25)] dark:before:shadow-[inset_0_1px_0_rgb(255_255_255/0.7),0_1px_2px_rgb(0_0_0/0.5)] dark:after:shadow-[inset_0_1px_0_rgb(255_255_255/0.7),0_1px_2px_rgb(0_0_0/0.5)]"
</script>

<template>
  <Part v-bind="rest" :offset="props.offset" :class="cn(base, attrs.class as any)">
    <template #default="s">
      <template v-for="_month in record(s.state.month)" :key="s.state.month">
        <slot v-bind="s ?? {}">
          <CalendarWeekdays />
          <CalendarWeeks />
        </slot>
      </template>
    </template>
    <template v-for="n in names" :key="n" #[n]="s">
      <slot :name="n" v-bind="s ?? {}" />
    </template>
  </Part>
</template>
