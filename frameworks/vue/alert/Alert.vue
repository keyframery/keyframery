<script setup lang="ts">
/* Animated alert on UI SDK's core (src/components/primitives/alert.tsx) with the Keyframery look (src/components/ui/alert.tsx).
   - Arrives: drops into place out of a blur, growing from 0.96 (data-starting-style, from animateIn).
   - The icon (an svg placed directly in the alert) pops in, then its strokes draw; title and description cascade after it.
   - Leaves: fades, blurs and folds its height away (data-ending-style, from animateOut).
   - Flourish: the drop beyond 8px, the blur, the icon's pop and draw, the cascade and the press dip scale with --kf-flourish.
   `open` / `v-model:open` / `default-open`; `@open-change` runs when AlertClose dismisses it. */
import { computed, useAttrs } from "vue"

import type { AlertVariant } from "@/components/keyframery/core/alert-core"
import { Speed, type Speed as SpeedValue } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

import { parts } from "./parts"

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{ variant?: AlertVariant; open?: boolean; defaultOpen?: boolean; speed?: SpeedValue }>(), {
  variant: undefined,
  open: undefined,
  defaultOpen: undefined,
  speed: undefined,
})
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const base = cn(
  /* Primitive motion. */
  "group/alert [interpolate-size:allow-keywords]",
  "transition-[opacity,translate,scale,filter,height,padding-block,margin-block] duration-[calc(520ms*var(--kf-speed,1))] ease-spring",
  "data-starting-style:-translate-y-[calc(0.5rem+0.25rem*var(--kf-flourish,1))] data-starting-style:scale-[0.96] data-starting-style:opacity-0 data-starting-style:blur-[calc(6px*var(--kf-flourish,1))]",
  "data-ending-style:h-0 data-ending-style:overflow-hidden data-ending-style:py-0 data-ending-style:my-0",
  "data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-ending-style:blur-[calc(4px*var(--kf-flourish,1))]",
  "data-ending-style:duration-[calc(260ms*var(--kf-speed,1))] data-ending-style:ease-house",
  "[&>svg]:origin-center [&>svg]:animate-[kf-alert-pop_calc(460ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-pop)_backwards] [&>svg]:[animation-delay:calc(70ms*var(--kf-speed,1)*var(--kf-flourish,1))]",
  "[&>svg_*]:animate-[kf-alert-draw_calc(620ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-house)_backwards] [&>svg_*]:[animation-delay:calc(170ms*var(--kf-speed,1)*var(--kf-flourish,1))]",
  "motion-reduce:transition-none! motion-reduce:[&>svg]:animate-none motion-reduce:[&>svg_*]:animate-none",
  /* The look: a quiet card with a hairline; the icon sits in a small tile tinted by the variant. */
  "relative grid w-full grid-cols-[0_1fr] items-start gap-y-[var(--alert-gap,0.25rem)] rounded-[var(--alert-radius,14px)] bg-[var(--alert-face,var(--card))] px-[var(--alert-inset-x,1rem)] py-[var(--alert-inset-y,0.875rem)] text-[length:var(--alert-font,13px)] text-[color:var(--alert-ink,var(--card-foreground))]",
  "has-[>svg]:grid-cols-[28px_1fr] has-[>svg]:gap-x-3 has-[>[data-slot=alert-close]]:pr-12",
  "shadow-[0_0_0_1px_rgb(0_0_0/0.07),0_1px_2px_rgb(0_0_0/0.04),0_4px_12px_-6px_rgb(0_0_0/0.08)]",
  "dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_4px_12px_-6px_rgb(0_0_0/0.6)]",
  "[&>svg]:row-span-2 [&>svg]:box-content [&>svg]:size-4 [&>svg]:rounded-[8px] [&>svg]:bg-muted [&>svg]:p-1.5 [&>svg]:text-foreground",
  "data-[variant=destructive]:[&>svg]:bg-destructive/10 data-[variant=destructive]:[&>svg]:text-destructive",
  "dark:data-[variant=destructive]:[&>svg]:bg-destructive/20",
  "data-[variant=destructive]:shadow-[0_0_0_1px_color-mix(in_oklch,var(--destructive)_22%,transparent),0_1px_2px_rgb(0_0_0/0.04),0_4px_12px_-6px_rgb(0_0_0/0.08)]",
  "dark:data-[variant=destructive]:shadow-[0_0_0_1px_color-mix(in_oklch,var(--destructive)_35%,transparent),0_4px_12px_-6px_rgb(0_0_0/0.6)]",
)
</script>

<template>
  <Speed :speed="props.speed">
    <parts.Root :variant="props.variant" :open="props.open" :default-open="props.defaultOpen" v-bind="forwarded" :class="cn(base, attrs.class as any)">
      <template v-for="(_, name) in $slots" #[name]="scope"><slot :name="name" v-bind="scope ?? {}" /></template>
    </parts.Root>
  </Speed>
</template>

<style>
/* Rows rise out of a blur; the icon pops; its strokes draw. Under reduced motion only the fade is left. */
@keyframes kf-alert-rise { from { opacity: 0; translate: 0 6px; filter: blur(4px) } }
@keyframes kf-alert-pop { from { opacity: 0; scale: 0.4 } }
@keyframes kf-alert-draw { from { stroke-dasharray: 80; stroke-dashoffset: 80 } to { stroke-dasharray: 80; stroke-dashoffset: 0 } }
@media (prefers-reduced-motion: reduce) {
  @keyframes kf-alert-rise { from { opacity: 0 } }
  @keyframes kf-alert-pop { from { opacity: 0 } }
  @keyframes kf-alert-draw { from { opacity: 1 } }
}
</style>
