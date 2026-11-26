<script setup lang="ts">
import { computed, useAttrs, useSlots } from "vue"
import { DatePickerPreset as Part, type DatePickerValue } from "@ui-sdk/vue/date-picker"
import { cn } from "@/lib/utils"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const props = defineProps<{ value: DatePickerValue }>()
const rest = computed(() => {
  const { class: _class, ...r } = attrs
  return r
})
const slots = useSlots()
const names = computed(() => Object.keys(slots))
const base = "ease-pop active:scale-[calc(1-0.04*var(--kf-flourish,1))] data-disabled:active:scale-100 motion-reduce:transition-none! inline-flex h-7 cursor-pointer items-center rounded-[8px] px-2.5 text-[12px] leading-none font-medium whitespace-nowrap text-muted-foreground outline-none select-none transition-[color,background-color,box-shadow,scale] duration-[calc(200ms*var(--kf-speed,1))] hover:bg-foreground/[0.05] hover:text-[color:var(--date-picker-ink,var(--foreground))] data-selected:bg-[var(--date-picker-face,var(--background))] data-selected:text-[color:var(--date-picker-ink,var(--foreground))] data-selected:shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_1px_rgb(0_0_0/0.05),0_3px_6px_-2px_rgb(0_0_0/0.1)] dark:data-selected:bg-accent dark:data-selected:shadow-[0_0_0_1px_rgb(255_255_255/0.07),inset_0_1px_0_rgb(255_255_255/0.08),0_2px_6px_-1px_rgb(0_0_0/0.6)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-popover data-disabled:pointer-events-none data-disabled:opacity-40"
</script>

<template>
  <Part v-bind="rest" :value="props.value" :class="cn(base, attrs.class as any)">
    <template v-for="n in names" :key="n" #[n]="s">
      <slot :name="n" v-bind="s ?? {}" />
    </template>
  </Part>
</template>
