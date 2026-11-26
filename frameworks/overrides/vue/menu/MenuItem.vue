<script setup lang="ts">
import { computed, useAttrs, useSlots } from "vue"
import { MenuItem as Part } from "@ui-sdk/vue/menu"
import { cn } from "@/lib/utils"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const rest = computed(() => {
  const { class: _class, ...r } = attrs
  return r
})
const slots = useSlots()
const names = computed(() => Object.keys(slots))
const base = "data-highlighted:[anchor-name:--kf-hl] relative flex min-h-[var(--menu-row-height,2rem)] cursor-default items-center gap-2 rounded-[var(--menu-item-radius,8px)] px-2 py-1.5 text-[13px] leading-4 outline-none select-none data-highlighted:text-[color:var(--menu-ink,var(--accent-foreground))] data-disabled:text-muted-foreground/60 data-disabled:data-highlighted:text-muted-foreground/60 [[data-has-icons]>&:not([data-has-icon])]:ps-8 [[data-has-icons]>[role=group]>&:not([data-has-icon])]:ps-8 *:data-[slot=menu-shortcut]:ms-auto *:data-[slot=menu-shortcut]:ps-5 *:data-[slot=menu-shortcut]:text-[12px] *:data-[slot=menu-shortcut]:tracking-[0.04em] *:data-[slot=menu-shortcut]:text-muted-foreground data-destructive:text-[color:var(--menu-danger,var(--destructive))] data-destructive:data-highlighted:text-[color:var(--menu-danger,var(--destructive))] data-pending:cursor-progress data-pending:text-muted-foreground data-pending:after:ms-auto data-pending:after:size-3 data-pending:after:shrink-0 data-pending:after:animate-spin data-pending:after:rounded-full data-pending:after:border-[1.5px] data-pending:after:border-current data-pending:after:border-t-transparent motion-reduce:data-pending:after:animate-none!"
</script>

<template>
  <Part v-bind="rest" :class="cn(base, attrs.class as any)">
    <template v-for="n in names" :key="n" #[n]="s">
      <slot :name="n" v-bind="s ?? {}" />
    </template>
  </Part>
</template>
