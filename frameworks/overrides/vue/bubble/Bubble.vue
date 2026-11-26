<script setup lang="ts">
/* Animated chat bubble on UI SDK's core (src/components/primitives/bubble.tsx) with the Keyframery look (src/components/ui/bubble.tsx).
   A soft 18px bubble whose corner toward the sender is tucked to 4px; your own are the primary colour.
   - Pop: a new bubble grows out of its tail corner from 60%, with a blur that clears, settling with ease-pop.
   - Flourish: the growth below 95%, the blur and the stagger scale with --kf-flourish; at 0 a bubble fades in with a small scale.
   It plays its entrance when it mounts, unless it sits in a message already there when its message scroller first showed. */
import { computed, onMounted, ref, useAttrs } from "vue"

import type { BubbleVariant } from "@/components/keyframery/core/bubble-core"
import { Speed, type Speed as SpeedValue } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

import { parts } from "./parts"

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{ variant?: BubbleVariant; align?: "start" | "end"; speed?: SpeedValue }>(), {
  variant: undefined,
  align: undefined,
  speed: undefined,
})
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const base = "group/bubble origin-bottom-left rtl:origin-bottom-right data-[align=end]:origin-bottom-right rtl:data-[align=end]:origin-bottom-left transition-[scale,translate,opacity,filter] duration-[calc(560ms*var(--kf-speed,1))] ease-pop data-starting-style:scale-[calc(0.95-0.35*var(--kf-flourish,1))] data-starting-style:translate-y-2 data-starting-style:opacity-0 data-starting-style:blur-[calc(6px*var(--kf-flourish,1))] data-starting-style:transition-none motion-reduce:transition-none! relative flex w-fit max-w-[var(--bubble-max-width,80%)] min-w-0 flex-col gap-1 data-[align=end]:self-end group-data-[align=end]/message:self-end data-[variant=default]:*:data-[slot=bubble-content]:bg-primary data-[variant=default]:*:data-[slot=bubble-content]:text-primary-foreground data-[variant=default]:*:data-[slot=bubble-content]:shadow-[inset_0_1px_0_rgb(255_255_255/0.12),0_1px_2px_rgb(0_0_0/0.12)] data-[variant=default]:[&>[data-slot=bubble-content]:is(button,a):hover]:bg-[color-mix(in_oklab,var(--primary),var(--background)_10%)] data-[variant=secondary]:*:data-[slot=bubble-content]:bg-[var(--bubble-face,var(--message-face,var(--secondary)))] data-[variant=secondary]:*:data-[slot=bubble-content]:text-secondary-foreground data-[variant=secondary]:[&>[data-slot=bubble-content]:is(button,a):hover]:bg-[color-mix(in_oklab,var(--secondary),var(--foreground)_5%)] data-[variant=muted]:*:data-[slot=bubble-content]:bg-[var(--bubble-face,var(--message-face,var(--muted)))] data-[variant=muted]:*:data-[slot=bubble-content]:text-[color:var(--bubble-ink,var(--foreground))] data-[variant=muted]:*:data-[slot=bubble-content]:shadow-[inset_0_0_0_1px_rgb(0_0_0/0.03)] dark:data-[variant=muted]:*:data-[slot=bubble-content]:shadow-[inset_0_0_0_1px_rgb(255_255_255/0.04)] data-[variant=muted]:[&>[data-slot=bubble-content]:is(button,a):hover]:bg-[color-mix(in_oklab,var(--muted),var(--foreground)_5%)] data-[variant=tinted]:*:data-[slot=bubble-content]:bg-[var(--bubble-face,var(--message-face,color-mix(in_oklab,var(--primary)_9%,var(--background))))] data-[variant=tinted]:*:data-[slot=bubble-content]:text-[color:var(--bubble-ink,var(--foreground))] dark:data-[variant=tinted]:*:data-[slot=bubble-content]:bg-[var(--bubble-face,var(--message-face,color-mix(in_oklab,var(--primary)_16%,var(--background))))] data-[variant=tinted]:[&>[data-slot=bubble-content]:is(button,a):hover]:bg-[color-mix(in_oklab,var(--primary)_14%,var(--background))] data-[variant=outline]:*:data-[slot=bubble-content]:bg-[var(--bubble-face,var(--message-face,var(--background)))] data-[variant=outline]:*:data-[slot=bubble-content]:text-[color:var(--bubble-ink,var(--foreground))] data-[variant=outline]:*:data-[slot=bubble-content]:shadow-[0_0_0_1px_rgb(0_0_0/0.09),0_1px_2px_rgb(0_0_0/0.05)] dark:data-[variant=outline]:*:data-[slot=bubble-content]:shadow-[0_0_0_1px_rgb(255_255_255/0.1)] data-[variant=outline]:[&>[data-slot=bubble-content]:is(button,a):hover]:bg-[var(--bubble-face,var(--message-face,var(--muted)))] data-[variant=ghost]:max-w-full data-[variant=ghost]:*:data-[slot=bubble-content]:rounded-none data-[variant=ghost]:*:data-[slot=bubble-content]:bg-transparent data-[variant=ghost]:*:data-[slot=bubble-content]:p-0 data-[variant=destructive]:*:data-[slot=bubble-content]:bg-destructive/10 data-[variant=destructive]:*:data-[slot=bubble-content]:text-destructive dark:data-[variant=destructive]:*:data-[slot=bubble-content]:bg-destructive/20 data-[variant=destructive]:[&>[data-slot=bubble-content]:is(button,a):hover]:bg-destructive/15"
/* The core plays the entrance when the part binds, unless it sits in history (closest("[data-history]") on a
   message scroller's item). Vue binds a part before its ancestors are in the page, so it joins once mounted
   (React's refs attach after the whole tree is in). */
const mounted = ref(false)
onMounted(() => (mounted.value = true))
</script>

<template>
  <Speed :speed="props.speed">
    <parts.Root v-if="mounted" :variant="props.variant" :align="props.align" v-bind="forwarded" :class="cn(base, attrs.class as any)">
      <template v-for="(_, name) in $slots" #[name]="scope"><slot :name="name" v-bind="scope ?? {}" /></template>
    </parts.Root>
  </Speed>
</template>
