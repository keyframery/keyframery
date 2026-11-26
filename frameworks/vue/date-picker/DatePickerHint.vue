<script setup lang="ts">
import { computed, useAttrs, useSlots } from "vue"
import { DatePickerHint as Part } from "@ui-sdk/vue/date-picker"
import { cn } from "@/lib/utils"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const rest = computed(() => {
  const { class: _class, ...r } = attrs
  return r
})
const slots = useSlots()
const names = computed(() => Object.keys(slots))
const base = "px-0.5 text-[12px] text-muted-foreground tabular-nums group-data-invalid/picker:text-destructive"
</script>

<template>
  <Part v-bind="rest" :class="cn(base, attrs.class as any)">
    <template v-for="n in names" :key="n" #[n]="s">
      <slot :name="n" v-bind="s ?? {}" />
    </template>
  </Part>
</template>
