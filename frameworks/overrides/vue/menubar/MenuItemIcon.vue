<script setup lang="ts">
import { computed, useAttrs, useSlots } from "vue"
import { MenuItemIcon as Part } from "@ui-sdk/vue/menu"
import { cn } from "@/lib/utils"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const rest = computed(() => {
  const { class: _class, ...r } = attrs
  return r
})
const slots = useSlots()
const names = computed(() => Object.keys(slots))
const base = "flex size-4 shrink-0 items-center justify-center text-muted-foreground [&>svg]:size-4 in-data-destructive:text-current in-data-highlighted:text-current rtl:data-mirror:-scale-x-100"
</script>

<template>
  <Part v-bind="rest" :class="cn(base, attrs.class as any)">
    <template v-for="n in names" :key="n" #[n]="s">
      <slot :name="n" v-bind="s ?? {}" />
    </template>
  </Part>
</template>
