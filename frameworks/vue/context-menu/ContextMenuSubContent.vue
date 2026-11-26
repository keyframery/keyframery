<script setup lang="ts">
import { computed, useAttrs, useSlots } from "vue"
import { MenuSubContent } from "@/components/keyframery/menu"
import { cn } from "@/lib/utils"
import { contextTheme } from "./classes"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const slots = useSlots()
const rest = computed(() => {
  const { class: _class, ...r } = attrs
  return r
})
const names = computed(() => Object.keys(slots))
</script>

<template>
  <MenuSubContent v-bind="rest" :class="cn(contextTheme, attrs.class as any)">
    <template v-for="n in names" :key="n" #[n]="s">
      <slot :name="n" v-bind="s ?? {}" />
    </template>
  </MenuSubContent>
</template>
