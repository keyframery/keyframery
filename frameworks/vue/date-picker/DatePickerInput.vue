<script setup lang="ts">
import { computed, useAttrs, useSlots } from "vue"
import { DatePickerInput as Part } from "@ui-sdk/vue/date-picker"
import { cn } from "@/lib/utils"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const rest = computed(() => {
  const { class: _class, ...r } = attrs
  return r
})
const slots = useSlots()
const names = computed(() => Object.keys(slots))
const base = "h-full w-full min-w-0 flex-1 bg-transparent text-[13px] text-[color:var(--date-picker-ink,var(--foreground))] tabular-nums outline-none placeholder:text-muted-foreground/70 data-disabled:cursor-not-allowed data-disabled:text-muted-foreground"
</script>

<template>
  <Part v-bind="rest" :class="cn(base, attrs.class as any)">
    <template v-for="n in names" :key="n" #[n]="s">
      <slot :name="n" v-bind="s ?? {}" />
    </template>
  </Part>
</template>
