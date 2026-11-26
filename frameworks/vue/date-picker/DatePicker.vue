<script setup lang="ts">
/* The root. Notes which way the months turn (opening or closing starts fresh, so a reopened calendar
   doesn't slide), and shares the field box the popup lines up with.
   A popover on wide screens and a sheet from the bottom edge on small touch screens (UI SDK's
   presentation="auto"). Pass presentation="popover" to keep it floating everywhere. */
import { computed, provide, ref, useAttrs, useSlots } from "vue"
import { DatePicker as Part } from "@ui-sdk/vue/date-picker"
import { speedKey, speedValue, type Speed } from "@/lib/keyframery"
import { cn } from "@/lib/utils"
import { pickerKey } from "./context"
import DatePickerContent from "./DatePickerContent.vue"
import DatePickerField from "./DatePickerField.vue"
import DatePickerInput from "./DatePickerInput.vue"
import DatePickerTrigger from "./DatePickerTrigger.vue"

defineOptions({ inheritAttrs: false })
const props = withDefaults(
  defineProps<{ speed?: Speed; months?: number; presentation?: "auto" | "popover" | "sheet" }>(),
  { months: 1, presentation: "auto" },
)
const attrs = useAttrs()
const slots = useSlots()
const rest = computed(() => {
  const { class: _class, style: _style, ...r } = attrs
  return r
})
const names = computed(() => Object.keys(slots).filter((n) => n !== "default"))
const speed = computed(() => speedValue(props.speed))
provide(speedKey, speed)

const direction = ref<"next" | "previous" | "none">("none")
const field = ref<HTMLElement | null>(null)
const shown = { current: null as string | null }
const months = computed(() => Math.max(1, Math.floor(props.months) || 1))
provide(pickerKey, { shown, direction, months, field })

function onMonthChange(month: string) {
  direction.value = shown.current && month < shown.current ? "previous" : "next"
}
function onOpenChange() {
  direction.value = "none"
}
const style = computed(() => [attrs.style as any, speed.value === undefined ? undefined : { "--kf-speed": speed.value }])
</script>

<template>
  <Part v-bind="rest" :months="props.months" :presentation="props.presentation" :class="cn('group/picker flex w-full flex-col gap-1.5', attrs.class as any)"
    :style="style" @month-change="onMonthChange" @open-change="onOpenChange">
    <template #default="s">
      <slot v-bind="s ?? {}">
        <DatePickerField>
          <DatePickerInput />
          <template v-if="attrs.mode === 'range'">
            <span aria-hidden="true" class="px-1 text-muted-foreground/70">–</span>
            <DatePickerInput end />
          </template>
          <DatePickerTrigger />
        </DatePickerField>
        <DatePickerContent />
      </slot>
    </template>
    <template v-for="n in names" :key="n" #[n]="s">
      <slot :name="n" v-bind="s ?? {}" />
    </template>
  </Part>
</template>
