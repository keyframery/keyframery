<script setup lang="ts">
import { computed, useAttrs, useSlots } from "vue"
import { DatePickerClear as Part } from "@ui-sdk/vue/date-picker"
import { cn } from "@/lib/utils"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const rest = computed(() => {
  const { class: _class, ...r } = attrs
  return r
})
const slots = useSlots()
const names = computed(() => Object.keys(slots).filter((n) => n !== 'default'))
const base = "grid size-6 shrink-0 cursor-pointer place-items-center rounded-[7px] text-muted-foreground outline-none [&_svg]:size-3.5 transition-[color,background-color,opacity,scale] duration-[calc(150ms*var(--kf-speed,1))] ease-house hover:bg-foreground/[0.06] hover:text-[color:var(--date-picker-ink,var(--foreground))] active:scale-[calc(1-0.1*var(--kf-flourish,1))] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background data-empty:pointer-events-none data-empty:scale-[calc(0.95-0.2*var(--kf-flourish,1))] data-empty:opacity-0 data-disabled:pointer-events-none data-disabled:opacity-0 motion-reduce:transition-none!"
</script>

<template>
  <Part v-bind="rest" :class="cn(base, attrs.class as any)">
    <template #default="s">
      <slot v-bind="s ?? {}">
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="m4.5 4.5 7 7m0-7-7 7" />
      </svg>
      </slot>
    </template>
    <template v-for="n in names" :key="n" #[n]="s">
      <slot :name="n" v-bind="s ?? {}" />
    </template>
  </Part>
</template>
