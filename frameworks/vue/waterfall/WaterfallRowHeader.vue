<script setup lang="ts">
import { computed, useAttrs, useSlots } from "vue"
import { WaterfallRowHeader as Part } from "@ui-sdk/vue/waterfall"
import { cn } from "@/lib/utils"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const rest = computed(() => {
  const { class: _class, ...r } = attrs
  return r
})
const slots = useSlots()
const names = computed(() => Object.keys(slots))
const base = "flex h-full min-w-0 items-center gap-1 truncate font-medium ps-[calc((var(--waterfall-level)-1)*14px)] not-data-branch:ps-[calc((var(--waterfall-level)-1)*14px+20px)] data-[level=2]:font-normal data-[level=2]:text-[color:var(--waterfall-muted,var(--muted-foreground))] data-[level=2]:data-selected:text-[color:var(--waterfall-ink,var(--foreground))] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
</script>

<template>
  <Part v-bind="rest" :class="cn(base, attrs.class as any)">
    <template v-for="n in names" :key="n" #[n]="s">
      <slot :name="n" v-bind="s ?? {}" />
    </template>
  </Part>
</template>
