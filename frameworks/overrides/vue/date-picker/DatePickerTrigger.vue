<script setup lang="ts">
import { computed, useAttrs, useSlots } from "vue"
import { DatePickerTrigger as Part } from "@ui-sdk/vue/date-picker"
import { cn } from "@/lib/utils"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const rest = computed(() => {
  const { class: _class, ...r } = attrs
  return r
})
const slots = useSlots()
const names = computed(() => Object.keys(slots).filter((n) => n !== 'default'))
const base = "ease-pop active:scale-[calc(1-0.1*var(--kf-flourish,1))] data-disabled:active:scale-100 motion-reduce:transition-none! grid size-7 shrink-0 cursor-pointer place-items-center rounded-[7px] text-muted-foreground outline-none [&_svg]:size-4 transition-[color,background-color,scale] duration-[calc(200ms*var(--kf-speed,1))] hover:bg-foreground/[0.06] hover:text-[color:var(--date-picker-ink,var(--foreground))] data-open:bg-accent data-open:text-[color:var(--date-picker-ink,var(--foreground))] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background data-disabled:pointer-events-none data-disabled:opacity-50"
</script>

<template>
  <Part v-bind="rest" :class="cn(base, attrs.class as any)">
    <template #default="s">
      <slot v-bind="s ?? {}">
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect x="2.5" y="3.5" width="11" height="10" rx="2" />
        <path d="M2.5 6.75h11M5.5 2v2.5M10.5 2v2.5" />
      </svg>
      </slot>
    </template>
    <template v-for="n in names" :key="n" #[n]="s">
      <slot :name="n" v-bind="s ?? {}" />
    </template>
  </Part>
</template>
