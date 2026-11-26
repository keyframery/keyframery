<script setup lang="ts">
/* The bar: plain, one tab stop. Its triggers sit flat on it until hovered or open; the bar carries its own
   highlight (its `::before`), anchored to the hovered or open trigger, and glides it between them. */
import { computed, useAttrs, useSlots } from "vue"
import { Menubar as Part } from "@ui-sdk/vue/menubar"
import { Speed, type Speed as SpeedValue } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

defineOptions({ inheritAttrs: false })
const props = defineProps<{ speed?: SpeedValue }>()
const attrs = useAttrs()
const slots = useSlots()
const rest = computed(() => {
  const { class: _class, ...r } = attrs
  return r
})
const names = computed(() => Object.keys(slots))
const base = cn(
  cn(
    "relative isolate [anchor-scope:--kf-bar]",
    "before:pointer-events-none before:absolute before:-z-10 before:hidden before:bg-[color-mix(in_oklch,currentColor_9%,transparent)]",
    "before:[position-anchor:--kf-bar] before:top-[anchor(top)] before:right-[anchor(right)] before:bottom-[anchor(bottom)] before:left-[anchor(left)]",
    "before:[transition:top_calc(300ms*var(--kf-speed,1))_var(--ease-spring),right_calc(300ms*var(--kf-speed,1))_var(--ease-spring),bottom_calc(300ms*var(--kf-speed,1))_var(--ease-spring),left_calc(300ms*var(--kf-speed,1))_var(--ease-spring),opacity_calc(150ms*var(--kf-speed,1))_var(--ease-house)]",
    "has-[>[data-slot=menu-trigger]:hover,>[data-slot=menu-trigger][data-open],>[data-slot=menu-trigger]:focus-visible]:before:block starting:before:opacity-0",
    "motion-reduce:before:[transition:none]!",
  ),
  cn(
    "flex items-center gap-[var(--menubar-gap,0.125rem)] data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch",
    "before:rounded-[var(--menubar-item-radius,8px)] before:bg-[var(--menubar-highlight,var(--accent))]",
    "data-disabled:opacity-50",
  ),
)
</script>

<template>
  <Speed :speed="props.speed">
    <Part v-bind="rest" :class="cn(base, attrs.class as any)">
      <template v-for="n in names" :key="n" #[n]="s">
        <slot :name="n" v-bind="s ?? {}" />
      </template>
    </Part>
  </Speed>
</template>
