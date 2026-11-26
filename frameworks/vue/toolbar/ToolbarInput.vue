<script setup lang="ts">
import { computed, useAttrs, useSlots } from "vue"
import { ToolbarInput as Part } from "@ui-sdk/vue/toolbar"
import { cn } from "@/lib/utils"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const rest = computed(() => {
  const { class: _class, ...r } = attrs
  return r
})
const slots = useSlots()
const names = computed(() => Object.keys(slots))
const base = "h-[var(--toolbar-height,1.75rem)] min-w-0 rounded-[var(--toolbar-item-radius,8px)] bg-[var(--toolbar-key,var(--background))] px-2 text-[13px] text-[color:var(--toolbar-ink,var(--foreground))] outline-none placeholder:text-[color:var(--toolbar-ink,var(--muted-foreground))] shadow-[0_0_0_1px_rgb(0_0_0/0.09),0_1px_2px_rgb(0_0_0/0.05)] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.1)] transition-shadow duration-[calc(150ms*var(--kf-speed,1))] motion-reduce:transition-none! not-data-disabled:hover:shadow-[0_0_0_1px_rgb(0_0_0/0.16),0_1px_2px_rgb(0_0_0/0.05)] dark:not-data-disabled:hover:shadow-[0_0_0_1px_rgb(255_255_255/0.18)] focus-visible:shadow-[0_0_0_1px_var(--ring)] focus-visible:ring-[3px] focus-visible:ring-ring/25 dark:focus-visible:shadow-[0_0_0_1px_var(--ring)] data-disabled:cursor-not-allowed data-disabled:opacity-50"
</script>

<template>
  <Part v-bind="rest" :class="cn(base, attrs.class as any)">
    <template v-for="n in names" :key="n" #[n]="s">
      <slot :name="n" v-bind="s ?? {}" />
    </template>
  </Part>
</template>
