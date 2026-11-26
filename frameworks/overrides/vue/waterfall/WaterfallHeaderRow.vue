<script setup lang="ts">
import { computed, useAttrs, useSlots } from "vue"
import { WaterfallHeaderRow as Part } from "@ui-sdk/vue/waterfall"
import { cn } from "@/lib/utils"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const rest = computed(() => {
  const { class: _class, ...r } = attrs
  return r
})
const slots = useSlots()
const names = computed(() => Object.keys(slots))
const base = "col-span-full grid grid-cols-subgrid items-center gap-x-[var(--waterfall-gap,0.75rem)] px-3 mb-1 h-12 border-b border-border text-[11px] font-medium text-[color:var(--waterfall-muted,var(--muted-foreground))]"
</script>

<template>
  <Part v-bind="rest" :class="cn(base, attrs.class as any)">
    <template v-for="n in names" :key="n" #[n]="s">
      <slot :name="n" v-bind="s ?? {}" />
    </template>
  </Part>
</template>
