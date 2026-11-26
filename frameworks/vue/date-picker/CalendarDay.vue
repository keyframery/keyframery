<script setup lang="ts">
import { computed, useAttrs, useSlots } from "vue"
import { CalendarDay as Part } from "@ui-sdk/vue/date-picker"
import { cn } from "@/lib/utils"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const props = defineProps<{ value: string }>()
const rest = computed(() => {
  const { class: _class, ...r } = attrs
  return r
})
const slots = useSlots()
const names = computed(() => Object.keys(slots))
const base = "data-selected:not-data-range-middle:not-data-range-end:[anchor-name:--kf-day-a] data-range-start:[anchor-name:--kf-day-a] data-range-end:[anchor-name:--kf-day-b] data-range-start:data-range-end:[anchor-name:--kf-day-a,--kf-day-b] ease-pop active:scale-[calc(1-0.1*var(--kf-flourish,1))] data-disabled:active:scale-100 relative size-[var(--date-picker-day-size,2rem)] cursor-pointer rounded-[9px] p-0 text-center align-middle text-[13px] leading-none font-medium text-[color:var(--date-picker-ink,var(--foreground))] tabular-nums outline-none select-none transition-[color,background-color,scale] duration-[calc(200ms*var(--kf-speed,1))] not-data-selected:not-data-range-start:not-data-range-end:hover:bg-foreground/[0.06] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring data-selected:not-data-range-middle:text-primary-foreground data-range-start:text-primary-foreground data-range-end:text-primary-foreground data-today:font-semibold data-today:after:absolute data-today:after:bottom-[3px] data-today:after:left-1/2 data-today:after:size-1 data-today:after:-translate-x-1/2 data-today:after:rounded-full data-today:after:bg-foreground data-selected:not-data-range-middle:after:bg-primary-foreground data-range-start:after:bg-primary-foreground data-range-end:after:bg-primary-foreground data-range-middle:rounded-none data-range-middle:bg-accent data-range-middle:text-accent-foreground data-range-middle:first:rounded-l-[9px] data-range-middle:last:rounded-r-[9px] data-preview:not-data-range-start:not-data-range-end:rounded-none data-preview:not-data-range-start:not-data-range-end:bg-accent/70 data-preview:first:rounded-l-[9px] data-preview:last:rounded-r-[9px] data-outside:text-muted-foreground/55 data-disabled:cursor-default data-disabled:text-muted-foreground/45 data-disabled:hover:bg-transparent data-unavailable:line-through motion-reduce:transition-none!"
</script>

<template>
  <Part v-bind="rest" :value="props.value" :class="cn(base, attrs.class as any)">
    <template v-for="n in names" :key="n" #[n]="s">
      <slot :name="n" v-bind="s ?? {}" />
    </template>
  </Part>
</template>
