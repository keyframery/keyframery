<script setup lang="ts">
/* Animated badge on UI SDK's core (src/components/primitives/badge.tsx) with the Keyframery look (src/components/ui/badge.tsx).
   - Pops in when it mounts.
   - `count`: drawn as rolling digits (Roll), capped at `max` ("99+").
   - `dot`: a status dot that pops and sends out one ring each time what the badge says changes.
   The pop-in, the roll and the ping are flourish. Variants as shadcn/ui's badge, plus `success`. */
import { computed, isVNode, Text, useAttrs, useSlots, type VNode } from "vue"

import { Speed, type Speed as SpeedValue } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

import BadgeDot from "./BadgeDot.vue"
import { parts } from "./parts"
import Roll from "./Roll.vue"

defineOptions({ inheritAttrs: false })
const props = withDefaults(
  defineProps<{
    /** Renders the number as rolling digits that roll up or down when it changes. */
    count?: number
    /** Above this, shows `max+`. */
    max?: number
    /** A leading status dot that pulses once whenever the badge's value (count or text) changes. */
    dot?: boolean
    variant?: "default" | "secondary" | "outline" | "destructive" | "success"
    speed?: SpeedValue
  }>(),
  { count: undefined, max: undefined, dot: undefined, variant: "default", speed: undefined },
)
const attrs = useAttrs()
const slots = useSlots()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})

/* What the badge says, for a badge without `count`: its plain-text content, as React's Badge reads a
   string child. A change pulses the dot. */
const text = computed(() => {
  let nodes: VNode[] | undefined
  try {
    nodes = slots.default?.({ state: {} })
  } catch {
    return ""
  }
  if (!nodes?.length) return ""
  return nodes.every((n) => isVNode(n) && n.type === Text) ? nodes.map((n) => String(n.children ?? "")).join("") : ""
})

const variants = {
  default: "bg-[var(--badge-face,var(--primary))] text-[color:var(--badge-ink,var(--primary-foreground))] shadow-[inset_0_1px_0_rgb(255_255_255/0.14),0_1px_2px_rgb(0_0_0/0.18)]",
  secondary:
    "bg-[var(--badge-face,var(--secondary))] text-[color:var(--badge-ink,var(--secondary-foreground))] shadow-[inset_0_0_0_1px_rgb(0_0_0/0.04)] dark:shadow-[inset_0_0_0_1px_rgb(255_255_255/0.05)]",
  outline: "bg-[var(--badge-face,transparent)] text-[color:var(--badge-ink,var(--foreground))] shadow-[inset_0_0_0_1px_var(--badge-border,var(--input))]",
  destructive: "bg-[var(--badge-face,color-mix(in_oklab,var(--destructive)_12%,transparent))] text-[color:var(--badge-ink,var(--destructive))] dark:bg-[var(--badge-face,color-mix(in_oklab,var(--destructive)_18%,transparent))]",
  success:
    "bg-[var(--badge-face,color-mix(in_oklch,oklch(0.62_0.16_150)_14%,transparent))] text-[color:var(--badge-ink,color-mix(in_oklch,oklch(0.62_0.16_150)_82%,var(--foreground)))] dark:text-[color:var(--badge-ink,oklch(0.62_0.16_150))] dark:bg-[var(--badge-face,color-mix(in_oklch,oklch(0.62_0.16_150)_18%,transparent))]",
} as const

const popIn = "animate-[kf-badge-in_calc(380ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-pop)_backwards] motion-reduce:animate-none!"
const look = computed(() =>
  cn(
    "inline-flex h-[var(--badge-height,1.25rem)] w-fit shrink-0 items-center justify-center gap-[var(--badge-gap,0.375rem)] rounded-[var(--badge-radius,calc(infinity*1px))] px-[var(--badge-padding,0.5rem)] text-[length:var(--badge-font,11px)] leading-none font-medium whitespace-nowrap tabular-nums",
    "transition-[background-color,color,box-shadow] duration-[calc(200ms*var(--kf-speed,1))] ease-house motion-reduce:transition-none!",
    "[&>svg]:size-3 [&>svg]:shrink-0 [&_[data-slot=roll]]:leading-[15px] has-data-[slot=roll]:min-w-5 has-data-[slot=roll]:px-1.5",
    variants[props.variant],
  ),
)
</script>

<template>
  <Speed :speed="props.speed">
    <parts.Root
      :data-variant="props.variant"
      v-bind="forwarded"
      :count="props.count"
      :max="props.max"
      :dot="props.dot"
      :text="text"
      :class="cn(popIn, look, attrs.class as any)"
    >
      <template #default="{ state }">
        <BadgeDot v-if="state.dot" />
        <template v-if="state.count !== undefined">
          <Roll :text="state.countText" />
          <span class="sr-only">{{ state.countText }}</span>
        </template>
        <slot :state="state" />
      </template>
    </parts.Root>
  </Speed>
</template>

<style>
/* Two copies of each keyframe, one per data-pulse value: switching the animation name restarts it. */
@keyframes kf-badge-in { from { opacity: 0; scale: 0.6 } }
@keyframes kf-badge-in-b { from { opacity: 0; scale: 0.6 } }
@keyframes kf-badge-ping { from { opacity: 0.55; scale: 1 } to { opacity: 0; scale: 3.4 } }
@keyframes kf-badge-ping-b { from { opacity: 0.55; scale: 1 } to { opacity: 0; scale: 3.4 } }
</style>
