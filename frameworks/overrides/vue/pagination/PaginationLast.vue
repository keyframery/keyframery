<script setup lang="ts">
/* A step. It has reached its end when disabled: it stays focusable but reads as unavailable. Without
   content it shows a chevron and names itself "Last page". */
import { computed, useAttrs, useSlots } from "vue"
import { PaginationLast as Part } from "@ui-sdk/vue/pagination"
import { cn } from "@/lib/utils"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const slots = useSlots()
const rest = computed(() => {
  const { class: _class, ...r } = attrs
  return r
})
const names = computed(() => Object.keys(slots).filter((n) => n !== "default"))
const base = "ease-pop active:scale-[calc(1-0.08*var(--kf-flourish,1))] data-disabled:active:scale-100 relative inline-flex h-[var(--pagination-size,2rem)] min-w-[var(--pagination-size,2rem)] shrink-0 cursor-pointer items-center justify-center gap-1 rounded-[var(--pagination-key-radius,9px)] px-2 text-[13px] leading-none font-medium text-[color:var(--pagination-ink,var(--muted-foreground))] tabular-nums whitespace-nowrap outline-none select-none [&_svg]:size-4 [&_svg]:shrink-0 transition-[color,background-color,scale] duration-[calc(200ms*var(--kf-speed,1))] hover:text-[color:var(--pagination-selected-ink,var(--foreground))] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-muted motion-reduce:transition-none! hover:bg-foreground/[0.045] data-disabled:cursor-default data-disabled:opacity-40 data-disabled:hover:bg-transparent data-disabled:hover:text-[color:var(--pagination-ink,var(--muted-foreground))]"
</script>

<template>
  <Part :aria-label="$slots.default ? undefined : 'Last page'" v-bind="rest" :class="cn(base, attrs.class as any)">
    <template #default="s">
      <slot v-bind="s ?? {}">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M8 3.5 12.5 8 8 12.5M3.5 3.5 8 8l-4.5 4.5" />
        </svg>
      </slot>
    </template>
    <template v-for="n in names" :key="n" #[n]="s">
      <slot :name="n" v-bind="s ?? {}" />
    </template>
  </Part>
</template>
