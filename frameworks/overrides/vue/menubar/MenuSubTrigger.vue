<script setup lang="ts">
/* A row that keeps its highlight while its submenu is open, with a chevron that points to it and nudges
   toward it as it opens. */
import { computed, useAttrs, useSlots } from "vue"
import { MenuSubTrigger as Part } from "@ui-sdk/vue/menu"
import { cn } from "@/lib/utils"
import { primitiveRow, rowLook } from "./classes"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const slots = useSlots()
const rest = computed(() => {
  const { class: _class, ...r } = attrs
  return r
})
const names = computed(() => Object.keys(slots).filter((n) => n !== "default"))
const base = cn(
  cn(
    primitiveRow,
    "data-open:[anchor-name:--kf-hl]",
    "[&>svg:last-child]:transition-[translate] [&>svg:last-child]:duration-[calc(380ms*var(--kf-speed,1))] [&>svg:last-child]:ease-spring data-open:[&>svg:last-child]:translate-x-[calc(0.125rem*var(--kf-flourish,1))] rtl:data-open:[&>svg:last-child]:-translate-x-[calc(0.125rem*var(--kf-flourish,1))]",
    "motion-reduce:[&>svg:last-child]:transition-none",
  ),
  rowLook,
  "data-open:text-[color:var(--menubar-ink,var(--accent-foreground))]",
)
</script>

<template>
  <Part v-bind="rest" :class="cn(base, attrs.class as any)">
    <template #default="s">
      <slot v-bind="s ?? {}" />
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"
        class="ms-auto -me-0.5 size-4 shrink-0 text-muted-foreground rtl:-scale-x-100">
        <path d="m6 3.5 4.5 4.5L6 12.5" />
      </svg>
    </template>
    <template v-for="n in names" :key="n" #[n]="s">
      <slot :name="n" v-bind="s ?? {}" />
    </template>
  </Part>
</template>
