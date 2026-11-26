<script setup lang="ts">
import { computed, useAttrs, useSlots } from "vue"
import { WaterfallIndicator as Part } from "@ui-sdk/vue/waterfall"
import { cn } from "@/lib/utils"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const rest = computed(() => {
  const { class: _class, ...r } = attrs
  return r
})
const slots = useSlots()
const names = computed(() => Object.keys(slots).filter((n) => n !== 'default'))
const base = "transition-[rotate] duration-[calc(380ms*var(--kf-speed,1))] ease-spring data-expanded:rotate-90 rtl:data-expanded:-rotate-90 motion-reduce:transition-none! grid size-4 shrink-0 cursor-pointer place-items-center rounded-[5px] text-[color:var(--waterfall-muted,var(--muted-foreground))] hover:bg-foreground/[0.06] hover:text-[color:var(--waterfall-ink,var(--foreground))]"
</script>

<template>
  <Part v-bind="rest" :class="cn(base, attrs.class as any)">
    <template #default="s">
      <slot v-bind="s ?? {}">
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="size-3.5">
        <path d="m6 4 4 4-4 4" />
      </svg>
      </slot>
    </template>
    <template v-for="n in names" :key="n" #[n]="s">
      <slot :name="n" v-bind="s ?? {}" />
    </template>
  </Part>
</template>
