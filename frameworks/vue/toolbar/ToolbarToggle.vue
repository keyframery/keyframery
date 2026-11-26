<script setup lang="ts">
import { computed, useAttrs, useSlots } from "vue"
import { Toggle as Part } from "@ui-sdk/vue/toggle"
import { cn } from "@/lib/utils"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const rest = computed(() => {
  const { class: _class, ...r } = attrs
  return r
})
const slots = useSlots()
const names = computed(() => Object.keys(slots))
const base = "[transition:color_calc(150ms*var(--kf-speed,1))_var(--ease-house),background-color_calc(150ms*var(--kf-speed,1))_var(--ease-house),box-shadow_calc(150ms*var(--kf-speed,1))_var(--ease-house),scale_calc(260ms*var(--kf-speed,1))_var(--ease-pop)] not-data-disabled:active:scale-[calc(1-0.08*var(--kf-flourish,1))] not-data-disabled:active:[transition-duration:calc(100ms*var(--kf-speed,1))] motion-reduce:[transition:none]! relative inline-flex h-[var(--toolbar-height,1.75rem)] min-w-[var(--toolbar-height,1.75rem)] shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-[var(--toolbar-item-radius,8px)] px-1.5 text-[13px] leading-none font-medium whitespace-nowrap text-[color:var(--toolbar-ink,var(--muted-foreground))] outline-none select-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 not-data-disabled:hover:text-[color:var(--toolbar-ink,var(--foreground))] data-kf-toolbar-hl:not-data-disabled:text-[color:var(--toolbar-ink,var(--foreground))] focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-popover data-disabled:cursor-not-allowed data-disabled:opacity-40 data-pressed:bg-[var(--toolbar-key,var(--background))] data-pressed:text-[color:var(--toolbar-ink,var(--foreground))] data-pressed:shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_1px_rgb(0_0_0/0.05),0_3px_6px_-2px_rgb(0_0_0/0.1)] dark:data-pressed:bg-[var(--toolbar-key,var(--accent))] dark:data-pressed:shadow-[0_0_0_1px_rgb(255_255_255/0.07),inset_0_1px_0_rgb(255_255_255/0.08),0_2px_6px_-1px_rgb(0_0_0/0.6)]"
</script>

<template>
  <Part v-bind="rest" :class="cn(base, attrs.class as any)">
    <template v-for="n in names" :key="n" #[n]="s">
      <slot :name="n" v-bind="s ?? {}" />
    </template>
  </Part>
</template>
