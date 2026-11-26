<script setup lang="ts">
/* Icons, text, buttons or a count beside or around the control (align: inline-start, the default, inline-end, block-start, block-end). Pressing its text or icon focuses the control. */
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"

import { parts } from "./parts"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const base = "data-[align=inline-start]:order-first data-[align=inline-end]:order-last data-[align=block-start]:order-first data-[align=block-end]:order-last [&>svg]:[transition:color_calc(150ms*var(--kf-speed,1))_var(--ease-house)] motion-reduce:[&>svg]:[transition:none] flex shrink-0 cursor-text items-center gap-2 text-[length:var(--input-group-font,13px)] leading-none text-[color:var(--input-group-muted,var(--muted-foreground))] select-none [&>svg]:size-4 [&>svg]:shrink-0 group-data-focused/input-group:[&>svg]:text-[color:var(--input-group-ink,var(--foreground))] group-data-disabled/input-group:opacity-50 data-[align=inline-start]:ps-3 data-[align=inline-start]:has-[>button]:ps-1.5 data-[align=inline-end]:pe-3 data-[align=inline-end]:has-[>button]:pe-1.5 data-[align=block-start]:w-full data-[align=block-start]:px-[var(--input-group-inset-x,0.75rem)] data-[align=block-start]:pt-2.5 data-[align=block-end]:w-full data-[align=block-end]:px-[var(--input-group-inset-x,0.75rem)] data-[align=block-end]:pb-2.5 data-[align=block-end]:has-[>button]:pe-2 data-[align=block-end]:has-[>button]:pb-2"
</script>

<template>
  <parts.Addon v-bind="forwarded" :class="cn(base, attrs.class as any)">
    <template v-for="(_, name) in $slots" #[name]="scope"><slot :name="name" v-bind="scope ?? {}" /></template>
  </parts.Addon>
</template>
