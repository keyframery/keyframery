<script setup lang="ts">
/* The check draws itself. A branch with only some of its items checked shows a dash. The draw scales
   with --kf-flourish; at 0 the check and the fill just appear. */
import { computed, useAttrs, useSlots } from "vue"
import { TreeItemCheckbox as Part } from "@ui-sdk/vue/tree"
import { cn } from "@/lib/utils"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const slots = useSlots()
const rest = computed(() => {
  const { class: _class, ...r } = attrs
  return r
})
const names = computed(() => Object.keys(slots).filter((n) => n !== "default"))
const base = "group/checkbox grid size-4 shrink-0 place-items-center rounded-[5px] bg-background text-primary-foreground *:[grid-area:1/1] shadow-[0_0_0_1px_rgb(0_0_0/0.14),0_1px_2px_rgb(0_0_0/0.05)] dark:bg-accent/40 dark:shadow-[0_0_0_1px_rgb(255_255_255/0.14)] not-data-disabled:data-unchecked:hover:shadow-[0_0_0_1px_rgb(0_0_0/0.24),0_1px_2px_rgb(0_0_0/0.06)] dark:not-data-disabled:data-unchecked:hover:shadow-[0_0_0_1px_rgb(255_255_255/0.24)] transition-[background-color,box-shadow] duration-[calc(150ms*var(--kf-speed,1))] ease-house motion-reduce:transition-none! data-checked:bg-[var(--tree-accent,var(--primary))] data-indeterminate:bg-[var(--tree-accent,var(--primary))] dark:data-checked:bg-[var(--tree-accent,var(--primary))] dark:data-indeterminate:bg-[var(--tree-accent,var(--primary))] data-checked:shadow-[inset_0_1px_0_rgb(255_255_255/0.14),0_1px_2px_rgb(0_0_0/0.25)] data-indeterminate:shadow-[inset_0_1px_0_rgb(255_255_255/0.14),0_1px_2px_rgb(0_0_0/0.25)] dark:data-checked:shadow-[inset_0_1px_0_rgb(255_255_255/0.7),0_1px_2px_rgb(0_0_0/0.5)] dark:data-indeterminate:shadow-[inset_0_1px_0_rgb(255_255_255/0.7),0_1px_2px_rgb(0_0_0/0.5)] data-disabled:opacity-50"
const draw = "transition-[stroke-dashoffset] duration-[calc(200ms*var(--kf-speed,1)*var(--kf-flourish,1))] ease-house [stroke-dasharray:1] [stroke-dashoffset:1] motion-reduce:transition-none!"
</script>

<template>
  <Part v-bind="rest" :class="cn(base, attrs.class as any)">
    <template #default="s">
      <slot v-bind="s ?? {}">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4.25 8.4 6.9 11l4.85-5.75" path-length="1" :class="cn(draw, 'group-data-checked/checkbox:[stroke-dashoffset:0]')" />
        </svg>
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4.75 8h6.5" path-length="1" :class="cn(draw, 'group-data-indeterminate/checkbox:[stroke-dashoffset:0]')" />
        </svg>
      </slot>
    </template>
    <template v-for="n in names" :key="n" #[n]="s">
      <slot :name="n" v-bind="s ?? {}" />
    </template>
  </Part>
</template>
