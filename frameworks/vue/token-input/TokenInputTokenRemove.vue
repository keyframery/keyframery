<script setup lang="ts">
import { computed, useAttrs, useSlots } from "vue"
import { TokenInputTokenRemove as Part } from "@ui-sdk/vue/token-input"
import { cn } from "@/lib/utils"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const rest = computed(() => {
  const { class: _class, ...r } = attrs
  return r
})
const slots = useSlots()
const names = computed(() => Object.keys(slots).filter((n) => n !== 'default'))
const base = "transition-[scale,color,background-color] duration-[calc(200ms*var(--kf-speed,1))] ease-pop active:scale-[calc(1-0.2*var(--kf-flourish,1))] motion-reduce:transition-none! grid size-[18px] cursor-pointer place-items-center rounded-[5px] text-muted-foreground hover:bg-foreground/[0.08] hover:text-[color:var(--token-input-ink,var(--foreground))] in-data-selected:text-[color:color-mix(in_oklab,var(--token-input-ink,var(--primary-foreground))_70%,transparent)] in-data-selected:hover:bg-primary-foreground/15 in-data-selected:hover:text-primary-foreground data-disabled:pointer-events-none data-disabled:opacity-40 data-readonly:hidden [&_svg]:size-3"
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
