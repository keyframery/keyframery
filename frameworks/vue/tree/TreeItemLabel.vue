<script setup lang="ts">
import { computed, useAttrs, useSlots } from "vue"
import { TreeItemLabel as Part } from "@ui-sdk/vue/tree"
import { cn } from "@/lib/utils"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const rest = computed(() => {
  const { class: _class, ...r } = attrs
  return r
})
const slots = useSlots()
const names = computed(() => Object.keys(slots))
const base = "relative mt-px flex h-[var(--tree-height,1.75rem)] min-w-0 cursor-pointer items-center gap-2 rounded-[var(--tree-radius,8px)] pr-2 pl-2 not-data-branch:pl-8 text-[13px] leading-[1.35] font-[450] text-[color:var(--tree-ink,var(--foreground))] no-underline select-none [&_svg]:size-4 [&_svg]:shrink-0 transition-[color] duration-[calc(150ms*var(--kf-speed,1))] motion-reduce:transition-none! data-selected:text-[color:var(--tree-ink,var(--accent-foreground))] data-current:text-[color:var(--tree-ink,var(--accent-foreground))] data-disabled:cursor-not-allowed data-disabled:opacity-40 data-pending:cursor-progress"
</script>

<template>
  <Part v-bind="rest" :class="cn(base, attrs.class as any)">
    <template v-for="n in names" :key="n" #[n]="s">
      <slot :name="n" v-bind="s ?? {}" />
    </template>
  </Part>
</template>
