<script setup lang="ts">
/* A box that fills and draws its check when the option is chosen. The press and the draw scale with
   --kf-flourish; the fill stays. */
import { ComboboxItemIndicator } from "@ui-sdk/vue/combobox"
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{ keepMounted?: boolean }>(), { keepMounted: true })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const base = cn(
  "grid size-4 shrink-0 place-items-center rounded-[5px] text-transparent",
  "shadow-[inset_0_0_0_1px_rgb(0_0_0/0.18)] dark:shadow-[inset_0_0_0_1px_rgb(255_255_255/0.2)]",
  "transition-[background-color,box-shadow,scale] duration-[calc(320ms*var(--kf-speed,1))] ease-pop",
  "data-selected:bg-[var(--filter-accent,var(--primary))] data-selected:text-primary-foreground data-selected:shadow-[inset_0_0_0_1px_var(--filter-accent,var(--primary))]",
  "group-active/item:scale-[calc(1-0.12*var(--kf-flourish,1))]",
  "[&_path]:[stroke-dasharray:1_2] [&_path]:[stroke-dashoffset:1.2] [&_path]:transition-[stroke-dashoffset] [&_path]:delay-[calc(60ms*var(--kf-speed,1)*var(--kf-flourish,1))] [&_path]:duration-[calc(260ms*var(--kf-speed,1)*var(--kf-flourish,1))] [&_path]:ease-house",
  "data-selected:[&_path]:[stroke-dashoffset:0] group-data-starting-style/content:[&_path]:[stroke-dashoffset:1.2]!",
  "motion-reduce:transition-none! motion-reduce:[&_path]:transition-none!",
)
</script>

<template>
  <ComboboxItemIndicator :keep-mounted="props.keepMounted" v-bind="forwarded" :class="cn(base, attrs.class as any)">
    <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="m3.5 8.5 3 3 6-7" pathLength="1" />
    </svg>
  </ComboboxItemIndicator>
</template>
