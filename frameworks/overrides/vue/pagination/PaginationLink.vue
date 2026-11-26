<script setup lang="ts">
import { computed, useAttrs, useSlots } from "vue"
import { PaginationLink as Part } from "@ui-sdk/vue/pagination"
import { cn } from "@/lib/utils"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const props = defineProps<{ page: number }>()
const rest = computed(() => {
  const { class: _class, ...r } = attrs
  return r
})
const slots = useSlots()
const names = computed(() => Object.keys(slots))
const base = "data-current:[anchor-name:--kf-page] ease-pop active:scale-[calc(1-0.08*var(--kf-flourish,1))] data-disabled:active:scale-100 relative inline-flex h-[var(--pagination-size,2rem)] min-w-[var(--pagination-size,2rem)] shrink-0 cursor-pointer items-center justify-center gap-1 rounded-[var(--pagination-key-radius,9px)] px-2 text-[13px] leading-none font-medium text-[color:var(--pagination-ink,var(--muted-foreground))] tabular-nums whitespace-nowrap outline-none select-none [&_svg]:size-4 [&_svg]:shrink-0 transition-[color,background-color,scale] duration-[calc(200ms*var(--kf-speed,1))] hover:text-[color:var(--pagination-selected-ink,var(--foreground))] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-muted motion-reduce:transition-none! data-current:text-[color:var(--pagination-selected-ink,var(--foreground))] data-current:cursor-default"
</script>

<template>
  <Part v-bind="rest" :page="props.page" :class="cn(base, attrs.class as any)">
    <template v-for="n in names" :key="n" #[n]="s">
      <slot :name="n" v-bind="s ?? {}" />
    </template>
  </Part>
</template>
