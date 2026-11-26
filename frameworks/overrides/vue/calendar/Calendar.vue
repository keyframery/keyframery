<script setup lang="ts">
/* The card. Marks the way the months last turned as `data-direction="next" | "previous"`, so a new month's
   weeks come in from that side. Without content it lays out the heading, the month keys and a grid per month. */
import { computed, provide, ref, useAttrs, useSlots } from "vue"
import { Calendar as Part } from "@ui-sdk/vue/calendar"
import { speedKey, speedValue, type Speed } from "@/lib/keyframery"
import { cn } from "@/lib/utils"
import { shownMonthKey } from "./context"
import CalendarGrid from "./CalendarGrid.vue"
import CalendarHeader from "./CalendarHeader.vue"
import CalendarHeading from "./CalendarHeading.vue"
import CalendarNext from "./CalendarNext.vue"
import CalendarPrevious from "./CalendarPrevious.vue"

defineOptions({ inheritAttrs: false })
const props = defineProps<{ speed?: Speed }>()
const attrs = useAttrs()
const slots = useSlots()
const rest = computed(() => {
  const { class: _class, style: _style, ...r } = attrs
  return r
})
const names = computed(() => Object.keys(slots))
const speed = computed(() => speedValue(props.speed))
provide(speedKey, speed)

const shown = { current: null as string | null }
provide(shownMonthKey, shown)
const direction = ref<"next" | "previous" | "none">("none")
function onMonthChange(month: string) {
  direction.value = shown.current && month < shown.current ? "previous" : "next"
}
const months = computed(() => Math.max(1, Math.floor(Number(attrs.months ?? 1)) || 1))
const style = computed(() => [attrs.style as any, speed.value === undefined ? undefined : { "--kf-speed": speed.value }])

const base = cn(
  "group/calendar",
  "flex w-fit flex-col gap-2 rounded-[var(--calendar-radius,14px)] bg-[var(--calendar-face,var(--card))] p-3 text-[color:var(--calendar-ink,var(--card-foreground))]",
  "shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_2px_rgb(0_0_0/0.04),0_6px_16px_-6px_rgb(0_0_0/0.1)]",
  "dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_6px_16px_-6px_rgb(0_0_0/0.6)]",
)
</script>

<template>
  <Part v-bind="rest" :data-direction="direction" :class="cn(base, attrs.class as any)" :style="style" @month-change="onMonthChange">
    <template #default="s">
      <slot v-bind="s ?? {}">
        <CalendarHeader>
          <CalendarPrevious />
          <CalendarHeading />
          <CalendarNext />
        </CalendarHeader>
        <div class="flex gap-4">
          <CalendarGrid v-for="offset in months" :key="offset - 1" :offset="offset - 1" />
        </div>
      </slot>
    </template>
    <template v-for="n in names.filter((n) => n !== 'default')" :key="n" #[n]="s">
      <slot :name="n" v-bind="s ?? {}" />
    </template>
  </Part>
</template>
