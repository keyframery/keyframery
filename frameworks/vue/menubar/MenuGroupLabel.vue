<script setup lang="ts">
import { computed, useAttrs, useSlots } from "vue"
import { MenuGroupLabel as Part } from "@ui-sdk/vue/menu"
import { cn } from "@/lib/utils"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const rest = computed(() => {
  const { class: _class, ...r } = attrs
  return r
})
const slots = useSlots()
const names = computed(() => Object.keys(slots))
const base = "px-2 pt-1.5 pb-1 text-[11px] leading-4 font-medium text-muted-foreground select-none [[data-has-icons]>&]:ps-8 [[data-has-icons]>[role=group]>&]:ps-8"
</script>

<template>
  <Part v-bind="rest" :class="cn(base, attrs.class as any)">
    <template v-for="n in names" :key="n" #[n]="s">
      <slot :name="n" v-bind="s ?? {}" />
    </template>
  </Part>
</template>
