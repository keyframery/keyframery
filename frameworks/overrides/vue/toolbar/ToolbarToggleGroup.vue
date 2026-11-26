<script setup lang="ts">
import { computed, useAttrs, useSlots } from "vue"
import { ToggleGroup as Part } from "@ui-sdk/vue/toggle"
import { cn } from "@/lib/utils"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const rest = computed(() => {
  const { class: _class, ...r } = attrs
  return r
})
const slots = useSlots()
const names = computed(() => Object.keys(slots))
const base = "flex items-center gap-[var(--toolbar-gap,0.125rem)] data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch"
</script>

<template>
  <Part v-bind="rest" :class="cn(base, attrs.class as any)">
    <template v-for="n in names" :key="n" #[n]="s">
      <slot :name="n" v-bind="s ?? {}" />
    </template>
  </Part>
</template>
