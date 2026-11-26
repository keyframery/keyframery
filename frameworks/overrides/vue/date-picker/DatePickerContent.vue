<script setup lang="ts">
/* The sheet. Unfolds out of the field: from 0.86 and a 6px blur, 8px toward the field, growing from the
   point the doc gives; in on a spring, out quickly to 0.96. The scale below 0.95 and the blur scale with
   --kf-flourish. Without content it lays out a styled calendar. */
import { computed, inject, useAttrs, useSlots } from "vue"
import { DatePickerContent as Part } from "@ui-sdk/vue/date-picker"
import { useSpeedStyle } from "@/lib/keyframery"
import { cn } from "@/lib/utils"
import { pickerKey } from "./context"
import CalendarGrid from "./CalendarGrid.vue"
import CalendarHeader from "./CalendarHeader.vue"
import CalendarHeading from "./CalendarHeading.vue"
import CalendarNext from "./CalendarNext.vue"
import CalendarPrevious from "./CalendarPrevious.vue"

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{ sideOffset?: number; collisionPadding?: number; anchor?: any }>(), {
  sideOffset: 6,
  collisionPadding: 12,
  anchor: undefined,
})
const attrs = useAttrs()
const slots = useSlots()
const rest = computed(() => {
  const { class: _class, style: _style, ...r } = attrs
  return r
})
const names = computed(() => Object.keys(slots).filter((n) => n !== "default"))
const picker = inject(pickerKey, null)
const months = computed(() => picker?.months.value ?? 1)
const speedStyle = useSpeedStyle()
const style = computed(() => [speedStyle.value, attrs.style as any])
const base = "group/picker-content origin-(--transform-origin) transition-[opacity,scale,translate,filter] duration-[calc(380ms*var(--kf-speed,1))] ease-spring data-starting-style:scale-[calc(0.95-0.09*var(--kf-flourish,1))] data-starting-style:opacity-0 data-starting-style:blur-[calc(6px*var(--kf-flourish,1))] data-ending-style:scale-[0.96] data-ending-style:opacity-0 data-ending-style:blur-[calc(6px*var(--kf-flourish,1))] data-ending-style:duration-[calc(150ms*var(--kf-speed,1))] data-ending-style:ease-house data-[side=bottom]:data-starting-style:-translate-y-2 data-[side=top]:data-starting-style:translate-y-2 data-[side=left]:data-starting-style:translate-x-2 data-[side=right]:data-starting-style:-translate-x-2 data-[presentation=sheet]:data-starting-style:scale-100 data-[presentation=sheet]:data-starting-style:blur-none data-[presentation=sheet]:data-starting-style:translate-none data-[presentation=sheet]:data-ending-style:scale-100 data-[presentation=sheet]:data-ending-style:blur-none data-[presentation=sheet]:data-ending-style:translate-none motion-reduce:transition-none! z-50 flex w-max flex-col gap-2 rounded-[var(--date-picker-radius,14px)] bg-[var(--date-picker-face,var(--popover))] p-3 text-[color:var(--date-picker-ink,var(--popover-foreground))] outline-none shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_2px_6px_-2px_rgb(0_0_0/0.08),0_12px_32px_-8px_rgb(0_0_0/0.18)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_12px_32px_-8px_rgb(0_0_0/0.7)] data-[presentation=sheet]:m-0 data-[presentation=sheet]:w-auto! data-[presentation=sheet]:min-w-0! data-[presentation=sheet]:max-w-none! data-[presentation=sheet]:rounded-b-none data-[presentation=sheet]:pt-6 data-[presentation=sheet]:pb-[calc(0.75rem+env(safe-area-inset-bottom))] data-[presentation=sheet]:after:pointer-events-none data-[presentation=sheet]:after:absolute data-[presentation=sheet]:after:top-2 data-[presentation=sheet]:after:left-1/2 data-[presentation=sheet]:after:h-1 data-[presentation=sheet]:after:w-9 data-[presentation=sheet]:after:-translate-x-1/2 data-[presentation=sheet]:after:rounded-full data-[presentation=sheet]:after:bg-foreground/15 data-[presentation=sheet]:after:content-[''] data-[presentation=sheet]:items-center"
</script>

<template>
  <Part v-bind="rest" :side-offset="props.sideOffset" :collision-padding="props.collisionPadding"
    :anchor="props.anchor ?? picker?.field.value ?? undefined" :data-direction="picker?.direction.value ?? 'none'"
    :class="cn(base, attrs.class as any)" :style="style">
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
    <template v-for="n in names" :key="n" #[n]="s">
      <slot :name="n" v-bind="s ?? {}" />
    </template>
  </Part>
</template>
