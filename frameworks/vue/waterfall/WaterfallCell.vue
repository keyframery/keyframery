<script setup lang="ts">
import { computed, useAttrs, useSlots } from "vue"
import { WaterfallCell as Part } from "@ui-sdk/vue/waterfall"
import { cn } from "@/lib/utils"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const rest = computed(() => {
  const { class: _class, ...r } = attrs
  return r
})
const slots = useSlots()
const names = computed(() => Object.keys(slots))
const base = "flex h-full items-center whitespace-nowrap text-[color:var(--waterfall-muted,var(--muted-foreground))] tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
</script>

<template>
  <Part v-bind="rest" :class="cn(base, attrs.class as any)">
    <template v-for="n in names" :key="n" #[n]="s">
      <slot :name="n" v-bind="s ?? {}" />
    </template>
  </Part>
</template>
