<script setup lang="ts">
/* A flat label on the bar. The bar's highlight glides under it on hover and while it is open. */
import { computed, useAttrs, useSlots } from "vue"
import { MenuTrigger as Part } from "@ui-sdk/vue/menu"
import { cn } from "@/lib/utils"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const slots = useSlots()
const rest = computed(() => {
  const { class: _class, ...r } = attrs
  return r
})
const names = computed(() => Object.keys(slots))
const base = "hover:[anchor-name:--kf-bar] focus-visible:[anchor-name:--kf-bar] data-open:[anchor-name:--kf-bar] transition-[scale] duration-[calc(200ms*var(--kf-speed,1))] ease-pop active:scale-[calc(1-0.04*var(--kf-flourish,1))] motion-reduce:transition-none! inline-flex h-[var(--menubar-height,1.75rem)] shrink-0 cursor-default items-center justify-center gap-1.5 rounded-[var(--menubar-item-radius,8px)] px-2.5 text-[13px] leading-none font-medium whitespace-nowrap text-[color:var(--menubar-ink,var(--foreground))] outline-none select-none [&_svg]:size-4 [&_svg]:shrink-0 hover:text-[color:var(--menubar-ink,var(--accent-foreground))] data-open:text-[color:var(--menubar-ink,var(--accent-foreground))] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background aria-disabled:pointer-events-none aria-disabled:opacity-40 data-disabled:pointer-events-none data-disabled:opacity-40"
</script>

<template>
  <Part v-bind="rest" :class="cn(base, attrs.class as any)">
    <template v-for="n in names" :key="n" #[n]="s">
      <slot :name="n" v-bind="s ?? {}" />
    </template>
  </Part>
</template>
