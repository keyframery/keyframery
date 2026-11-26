<script setup lang="ts">
/* The media pops (from 0.6) and the strokes of an icon inside it draw; pictures pop one after another.
   `variant="icon"` is a raised key with the icon in it. */
import { computed, useAttrs } from "vue"

import type { EmptyMediaVariant } from "@/components/keyframery/core/empty-core"
import { cn } from "@/lib/utils"

import { parts } from "./parts"

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{ variant?: EmptyMediaVariant }>(), { variant: "default" })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const base = cn(
  "animate-[kf-empty-pop_calc(560ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-pop)_backwards]",
  "[&_svg_*]:animate-[kf-empty-draw_calc(720ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-house)_backwards] [&_svg_*]:[animation-delay:calc(160ms*var(--kf-speed,1)*var(--kf-flourish,1))]",
  "[&>img]:animate-[kf-empty-pop_calc(560ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-pop)_backwards] [&>img]:[animation-delay:calc((min(sibling-index(),6)-1)*70ms*var(--kf-speed,1)*var(--kf-flourish,1))]",
  "motion-reduce:animate-none motion-reduce:[&_svg_*]:animate-none motion-reduce:[&>img]:animate-none",
  "mb-2.5 flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0",
  "data-[variant=icon]:size-[var(--empty-media-size,3rem)] data-[variant=icon]:rounded-[var(--empty-radius,13px)] data-[variant=icon]:bg-[var(--empty-face,var(--background))] data-[variant=icon]:text-[color:var(--empty-ink,var(--foreground))] data-[variant=icon]:[&_svg:not([class*='size-'])]:size-[22px]",
  "data-[variant=icon]:shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_1px_rgb(0_0_0/0.05),0_3px_6px_-2px_rgb(0_0_0/0.1)]",
  "dark:data-[variant=icon]:bg-[var(--empty-face,var(--accent))] dark:data-[variant=icon]:shadow-[0_0_0_1px_rgb(255_255_255/0.07),inset_0_1px_0_rgb(255_255_255/0.08),0_2px_6px_-1px_rgb(0_0_0/0.6)]",
)
</script>

<template>
  <parts.Media :variant="props.variant" v-bind="forwarded" :class="cn(base, attrs.class as any)">
    <template v-for="(_, name) in $slots" #[name]="scope"><slot :name="name" v-bind="scope ?? {}" /></template>
  </parts.Media>
</template>
