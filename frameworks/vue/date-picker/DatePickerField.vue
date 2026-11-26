<script setup lang="ts">
/* The field: the typed date and the calendar key sit inside one box, and the ring follows the input's
   focus or the open calendar. The popup lines up with this box. */
import { inject, useAttrs } from "vue"
import { cn } from "@/lib/utils"
import { pickerKey } from "./context"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const picker = inject(pickerKey, null)
function setField(el: unknown) {
  if (picker) picker.field.value = (el as HTMLElement | null) ?? null
}
const base = "rounded-[10px] bg-[var(--date-picker-face,var(--background))] text-[13px] [--field-line:rgb(0_0_0/0.09)] dark:[--field-line:rgb(255_255_255/0.1)] shadow-[0_0_0_1px_var(--field-line),0_1px_2px_rgb(0_0_0/0.05)] dark:shadow-[0_0_0_1px_var(--field-line)] transition-[box-shadow,background-color] duration-[calc(150ms*var(--kf-speed,1))] ease-house motion-reduce:transition-none! hover:[--field-line:rgb(0_0_0/0.16)] dark:hover:[--field-line:rgb(255_255_255/0.18)] flex h-[var(--date-picker-height,2.25rem)] w-full min-w-0 cursor-text items-center gap-1 pr-1 pl-3 text-muted-foreground has-[input:focus-visible]:ring-[3px] has-[input:focus-visible]:ring-ring/25 has-[input:focus-visible]:[--field-line:var(--ring)] dark:has-[input:focus-visible]:[--field-line:var(--ring)] group-data-open/picker:[--field-line:var(--ring)] dark:group-data-open/picker:[--field-line:var(--ring)] group-data-open/picker:ring-[3px] group-data-open/picker:ring-ring/25 group-data-invalid/picker:ring-destructive/25! group-data-invalid/picker:[--field-line:var(--destructive)]! group-data-disabled/picker:cursor-not-allowed group-data-disabled/picker:bg-muted group-data-disabled/picker:[--field-line:rgb(0_0_0/0.06)] dark:group-data-disabled/picker:[--field-line:rgb(255_255_255/0.06)] group-data-readonly/picker:bg-muted/50"
</script>

<template>
  <div v-bind="attrs" :ref="setField" data-slot="date-picker-field" :class="cn(base, attrs.class as any)">
    <slot />
  </div>
</template>
