<script setup lang="ts">
import { computed, useAttrs, useSlots } from "vue"
import { MenuCheckboxItem as Part } from "@ui-sdk/vue/menu"
import { cn } from "@/lib/utils"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const props = defineProps<{ value: string }>()
const rest = computed(() => {
  const { class: _class, ...r } = attrs
  return r
})
const slots = useSlots()
const names = computed(() => Object.keys(slots))
const base = "data-highlighted:[anchor-name:--kf-hl] relative flex min-h-[var(--menu-row-height,2rem)] cursor-default items-center gap-2 rounded-[var(--menu-item-radius,8px)] px-2 py-1.5 text-[13px] leading-4 outline-none select-none data-highlighted:text-[color:var(--menu-ink,var(--accent-foreground))] data-disabled:text-muted-foreground/60 data-disabled:data-highlighted:text-muted-foreground/60 [[data-has-icons]>&:not([data-has-icon])]:ps-8 [[data-has-icons]>[role=group]>&:not([data-has-icon])]:ps-8"
</script>

<template>
  <Part v-bind="rest" :value="props.value" :class="cn(base, attrs.class as any)">
    <template v-for="n in names" :key="n" #[n]="s">
      <slot :name="n" v-bind="s ?? {}" />
    </template>
  </Part>
</template>
