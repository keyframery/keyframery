<script setup lang="ts">
import { computed, useAttrs, useSlots } from "vue"
import { PaginationEllipsis as Part } from "@ui-sdk/vue/pagination"
import { cn } from "@/lib/utils"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const rest = computed(() => {
  const { class: _class, ...r } = attrs
  return r
})
const slots = useSlots()
const names = computed(() => Object.keys(slots).filter((n) => n !== 'default'))
const base = "inline-flex h-[var(--pagination-size,2rem)] w-6 items-center justify-center text-[color:color-mix(in_oklab,var(--pagination-ink,var(--muted-foreground))_70%,transparent)] select-none [&_svg]:size-4"
</script>

<template>
  <Part v-bind="rest" :class="cn(base, attrs.class as any)">
    <template #default="s">
      <slot v-bind="s ?? {}">
      <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <circle cx="3.5" cy="8" r="1" />
          <circle cx="8" cy="8" r="1" />
          <circle cx="12.5" cy="8" r="1" />
        </svg>
      </slot>
    </template>
    <template v-for="n in names" :key="n" #[n]="s">
      <slot :name="n" v-bind="s ?? {}" />
    </template>
  </Part>
</template>
