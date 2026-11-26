<script setup lang="ts">
/* A key by default. Use the `render` slot to use a button of your own instead (it then keeps only the
   focus ring and the press). */
import { computed, useAttrs, useSlots } from "vue"
import { MenuTrigger as Part } from "@ui-sdk/vue/menu"
import { cn } from "@/lib/utils"
import { useMenuPart } from "./context"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const slots = useSlots()
const rest = computed(() => {
  const { class: _class, ...r } = attrs
  return r
})
const names = computed(() => Object.keys(slots))
useMenuPart("trigger")
const press = "transition-[scale] duration-[calc(200ms*var(--kf-speed,1))] ease-pop active:scale-[calc(1-0.04*var(--kf-flourish,1))] motion-reduce:transition-none!"
const ring = "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
const key = cn(
  "inline-flex h-8 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-[9px] bg-[var(--menu-trigger,var(--background))] px-3 text-[13px] leading-none font-medium whitespace-nowrap text-foreground select-none [&_svg]:size-4 [&_svg]:shrink-0",
  "shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_1px_rgb(0_0_0/0.05),0_3px_6px_-2px_rgb(0_0_0/0.1)]",
  "dark:bg-[var(--menu-trigger,var(--accent))] dark:shadow-[0_0_0_1px_rgb(255_255_255/0.07),inset_0_1px_0_rgb(255_255_255/0.08),0_2px_6px_-1px_rgb(0_0_0/0.6)]",
  "hover:bg-[var(--menu-trigger,var(--muted))] data-open:bg-[var(--menu-trigger,var(--muted))] dark:hover:bg-[color-mix(in_oklab,var(--menu-trigger,var(--accent))_80%,transparent)] dark:data-open:bg-[color-mix(in_oklab,var(--menu-trigger,var(--accent))_80%,transparent)]",
  "active:shadow-[0_0_0_1px_rgb(0_0_0/0.08),0_1px_1px_rgb(0_0_0/0.04)]",
  "dark:active:shadow-[0_0_0_1px_rgb(255_255_255/0.07),inset_0_1px_0_rgb(255_255_255/0.05),0_1px_2px_rgb(0_0_0/0.5)]",
  "data-disabled:cursor-not-allowed data-disabled:opacity-40 data-disabled:active:scale-100",
)
</script>

<template>
  <Part v-bind="rest" :class="cn(press, cn(ring, !$slots.render && key, attrs.class as any))">
    <template v-for="n in names" :key="n" #[n]="s">
      <slot :name="n" v-bind="s ?? {}" />
    </template>
  </Part>
</template>
