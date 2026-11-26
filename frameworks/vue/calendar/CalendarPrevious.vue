<script setup lang="ts">
import { computed, useAttrs, useSlots } from "vue"
import { CalendarPrevious as Part } from "@ui-sdk/vue/calendar"
import { cn } from "@/lib/utils"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const rest = computed(() => {
  const { class: _class, ...r } = attrs
  return r
})
const slots = useSlots()
const names = computed(() => Object.keys(slots).filter((n) => n !== 'default'))
const base = "transition-[scale] duration-[calc(200ms*var(--kf-speed,1))] ease-pop active:scale-[calc(1-0.08*var(--kf-flourish,1))] data-disabled:active:scale-100 motion-reduce:transition-none! inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-[9px] bg-background text-muted-foreground outline-none select-none [&_svg]:size-4 shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_1px_rgb(0_0_0/0.05),0_3px_6px_-2px_rgb(0_0_0/0.1)] dark:bg-accent dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07),inset_0_1px_0_rgb(255_255_255/0.08),0_2px_6px_-1px_rgb(0_0_0/0.6)] hover:text-[color:var(--calendar-ink,var(--foreground))] active:shadow-[0_0_0_1px_rgb(0_0_0/0.08),0_1px_1px_rgb(0_0_0/0.04)] dark:active:shadow-[0_0_0_1px_rgb(255_255_255/0.07),inset_0_1px_0_rgb(255_255_255/0.05),0_1px_2px_rgb(0_0_0/0.6)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card data-disabled:pointer-events-none data-disabled:opacity-40"
</script>

<template>
  <Part v-bind="rest" :class="cn(base, attrs.class as any)">
    <template #default="s">
      <slot v-bind="s ?? {}">
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M9.5 3.5 5 8l4.5 4.5" />
      </svg>
      </slot>
    </template>
    <template v-for="n in names" :key="n" #[n]="s">
      <slot :name="n" v-bind="s ?? {}" />
    </template>
  </Part>
</template>
