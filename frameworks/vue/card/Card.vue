<script setup lang="ts">
/* Animated card on UI SDK's core (src/components/primitives/card.tsx) with the Keyframery look (src/components/ui/card.tsx).
   - Cascade: the card fades up out of a light blur, then its parts follow one after another.
   - `interactive`: lifts 2px on hover and sinks while pressed (data-hovered, data-pressed).
   - `spotlight`: a soft light follows the pointer (--kf-x, --kf-y).
   - Flourish: the cascade, the lift and the press scale with --kf-flourish. */
import { computed, useAttrs } from "vue"

import { Speed, type Speed as SpeedValue } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

import { parts } from "./parts"

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{ interactive?: boolean; spotlight?: boolean; speed?: SpeedValue }>(), {
  interactive: undefined,
  spotlight: undefined,
  speed: undefined,
})
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})

/* Primitive motion. */
const cardMotion = cn(
  "group/card relative isolate",
  "animate-[kf-card-in_calc(520ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-spring)_backwards] motion-reduce:animate-none!",
  "[&>*]:animate-[kf-card-part_calc(560ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-spring)_backwards] motion-reduce:[&>*]:animate-none",
  "[&>*]:[animation-delay:calc(calc(70ms*var(--kf-speed,1)*var(--kf-flourish,1))+(min(sibling-index(),10)-1)*calc(70ms*var(--kf-speed,1)*var(--kf-flourish,1)))]",
  "[transition:translate_calc(420ms*var(--kf-speed,1))_var(--ease-spring),box-shadow_calc(320ms*var(--kf-speed,1))_var(--ease-house),scale_calc(280ms*var(--kf-speed,1))_var(--ease-pop)]",
  "[&[data-interactive]:is(:hover,[data-hovered])]:-translate-y-[calc(0.125rem*var(--kf-flourish,1))]",
  "[&[data-interactive]:is(:hover,[data-hovered]):is(:active,[data-pressed])]:translate-y-0 [&[data-interactive]:is(:active,[data-pressed])]:scale-[calc(1-0.015*var(--kf-flourish,1))]",
  "motion-reduce:[transition:none]!",
  "data-spotlight:before:pointer-events-none data-spotlight:before:absolute data-spotlight:before:inset-0 data-spotlight:before:-z-10 data-spotlight:before:rounded-[inherit]",
  "data-spotlight:before:bg-[radial-gradient(300px_circle_at_var(--kf-x,50%)_var(--kf-y,0%),var(--kf-spotlight,color-mix(in_oklch,currentColor_13%,transparent)),transparent_70%)]",
  "data-spotlight:before:opacity-0 data-spotlight:before:transition-opacity data-spotlight:before:duration-[calc(320ms*var(--kf-speed,1))] data-spotlight:before:ease-house",
  "data-spotlight:[&:is(:hover,[data-hovered])]:before:opacity-100 motion-reduce:before:transition-none!",
)

/* The look: a sheet that sits on the page; an interactive card's shadow grows as it lifts. */
const sheet = cn(
  "data-spotlight:before:bg-[radial-gradient(300px_circle_at_var(--kf-x,50%)_var(--kf-y,0%),var(--card-light,var(--kf-spotlight,color-mix(in_oklch,currentColor_13%,transparent))),transparent_70%)]",
  "flex flex-col gap-[var(--card-gap,1.25rem)] rounded-[var(--card-radius,16px)] bg-[var(--card-face,var(--card))] py-[var(--card-padding,1.25rem)] text-[color:var(--card-ink,var(--card-foreground))]",
  "shadow-[0_0_0_1px_rgb(0_0_0/0.07),0_1px_2px_rgb(0_0_0/0.04),0_4px_12px_-6px_rgb(0_0_0/0.08)]",
  "dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_1px_2px_rgb(0_0_0/0.4),0_6px_16px_-6px_rgb(0_0_0/0.6)]",
  "data-interactive:cursor-pointer outline-none",
  "[&[data-interactive]:is(:hover,[data-hovered])]:shadow-[0_0_0_1px_rgb(0_0_0/0.09),0_2px_4px_rgb(0_0_0/0.05),0_16px_32px_-12px_rgb(0_0_0/0.24)]",
  "dark:[&[data-interactive]:is(:hover,[data-hovered])]:shadow-[0_0_0_1px_rgb(255_255_255/0.12),0_2px_4px_rgb(0_0_0/0.4),0_18px_36px_-12px_rgb(0_0_0/0.8)]",
  "[&[data-interactive]:is(:hover,[data-hovered]):is(:active,[data-pressed])]:shadow-[0_0_0_1px_rgb(0_0_0/0.1),0_1px_2px_rgb(0_0_0/0.06),0_4px_10px_-6px_rgb(0_0_0/0.14)]",
  "dark:[&[data-interactive]:is(:hover,[data-hovered]):is(:active,[data-pressed])]:shadow-[0_0_0_1px_rgb(255_255_255/0.12),0_1px_2px_rgb(0_0_0/0.5),0_4px_10px_-6px_rgb(0_0_0/0.7)]",
  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
)
</script>

<template>
  <Speed :speed="props.speed">
    <parts.Root :interactive="props.interactive" :spotlight="props.spotlight" v-bind="forwarded" :class="cn(cardMotion, sheet, attrs.class as any)">
      <template v-for="(_, name) in $slots" #[name]="scope"><slot :name="name" v-bind="scope ?? {}" /></template>
    </parts.Root>
  </Speed>
</template>

<style>
/* Backwards fill: a part is hidden on its first frame and the delay never slows anything later. */
@keyframes kf-card-in { from { opacity: 0; scale: 0.97; filter: blur(6px) } }
@keyframes kf-card-part { from { opacity: 0; translate: 0 12px; filter: blur(5px) } }
</style>
