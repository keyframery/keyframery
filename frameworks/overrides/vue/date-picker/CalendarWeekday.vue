<script setup lang="ts">
import { computed, useAttrs, useSlots } from "vue"
import { CalendarWeekday as Part } from "@ui-sdk/vue/date-picker"
import { cn } from "@/lib/utils"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const props = defineProps<{ index: number }>()
const rest = computed(() => {
  const { class: _class, ...r } = attrs
  return r
})
const slots = useSlots()
const names = computed(() => Object.keys(slots))
const base = "h-7 w-[var(--date-picker-day-size,2rem)] p-0 text-center text-[11px] font-medium text-muted-foreground"
</script>

<template>
  <Part v-bind="rest" :index="props.index" :class="cn(base, attrs.class as any)">
    <template v-for="n in names" :key="n" #[n]="s">
      <slot :name="n" v-bind="s ?? {}" />
    </template>
  </Part>
</template>
