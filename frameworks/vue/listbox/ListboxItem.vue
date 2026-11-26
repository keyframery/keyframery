<script setup lang="ts">
import { computed, useAttrs, useSlots } from "vue"
import { ListboxItem as Part } from "@ui-sdk/vue/listbox"
import { cn } from "@/lib/utils"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const props = defineProps<{ value: any }>()
const rest = computed(() => {
  const { class: _class, ...r } = attrs
  return r
})
const slots = useSlots()
const names = computed(() => Object.keys(slots))
const base = "hover:[anchor-name:--kf-hl] data-highlighted:[anchor-name:--kf-hl] group-has-[[data-slot=listbox-item]:hover]/kf-lb:data-highlighted:not-hover:[anchor-name:none] group/item relative flex min-h-[var(--listbox-row-height,2rem)] shrink-0 cursor-default items-center gap-2 rounded-[var(--listbox-item-radius,8px)] px-2 py-1.5 leading-4 text-[color:var(--listbox-ink,var(--foreground))] outline-none select-none data-disabled:cursor-not-allowed data-disabled:text-muted-foreground/60 group-data-readonly/listbox:cursor-default [[data-has-icons]_&:not([data-has-icon])]:ps-8"
</script>

<template>
  <Part v-bind="rest" :value="props.value" :class="cn(base, attrs.class as any)">
    <template v-for="n in names" :key="n" #[n]="s">
      <slot :name="n" v-bind="s ?? {}" />
    </template>
  </Part>
</template>
