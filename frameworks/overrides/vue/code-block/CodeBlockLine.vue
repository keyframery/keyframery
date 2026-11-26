<script setup lang="ts">
/* A line: gutter number, then the code, each token a span with `data-token` set to its kind. Highlighted
   lines get a band that sweeps in from the left and a ring-coloured edge; added and removed lines a tint and
   a + or − in the gutter, so a diff doesn't rest on colour. */
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"

import { parts } from "./parts"

defineOptions({ inheritAttrs: false })
const props = defineProps<{ value: string }>()
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const base = cn(
  "relative block",
  /* Cascade: each line a beat after the one above it, the first 16 staggered. */
  "animate-[kf-code-line_calc(460ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-spring)_backwards]",
  "[animation-delay:calc((min(var(--code-line-index,0),16)*calc(22ms*var(--kf-speed,1))+calc(60ms*var(--kf-speed,1)))*var(--kf-flourish,1))]",
  /* Draw: the band sweeps in from the left. */
  "before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:origin-left before:scale-x-0 before:content-['']",
  "before:bg-[color-mix(in_oklch,currentColor_7%,transparent)]",
  "before:transition-[scale] before:duration-[calc(180ms*var(--kf-speed,1))] before:ease-house",
  "data-[variant=highlighted]:before:scale-x-100 data-[variant=added]:before:scale-x-100 data-[variant=removed]:before:scale-x-100",
  "data-[variant=highlighted]:before:duration-[calc(560ms*var(--kf-speed,1))] data-[variant=highlighted]:before:ease-spring",
  "data-[variant=highlighted]:before:[transition-delay:calc(min(var(--code-line-index,0),16)*calc(18ms*var(--kf-speed,1))*var(--kf-flourish,1))]",
  "motion-reduce:animate-none! motion-reduce:before:transition-none!",
)
const look = cn(
  "grid grid-cols-[1fr] px-[var(--code-block-inset-x,0.875rem)] group-data-[size=sm]/code-block:px-3",
  "in-data-numbered:grid-cols-[2.25rem_1fr] in-data-numbered:ps-1",
  "*:data-[slot=code-block-line-number]:pe-3 *:data-[slot=code-block-line-number]:text-end *:data-[slot=code-block-line-number]:text-muted-foreground/60 *:data-[slot=code-block-line-number]:tabular-nums",
  "*:data-[slot=code-block-line-number]:transition-colors *:data-[slot=code-block-line-number]:duration-[calc(200ms*var(--kf-speed,1))]",
  "data-[variant=highlighted]:*:data-[slot=code-block-line-number]:text-foreground",
  "before:bg-[color-mix(in_oklab,var(--ring)_9%,transparent)] dark:before:bg-[color-mix(in_oklab,var(--ring)_14%,transparent)]",
  "before:shadow-[inset_2px_0_0_var(--ring)]",
  "data-[variant=added]:before:bg-[oklch(0.62_0.16_150/0.1)] data-[variant=added]:before:shadow-[inset_2px_0_0_oklch(0.62_0.16_150)]",
  "data-[variant=removed]:before:bg-[color-mix(in_oklab,var(--destructive)_9%,transparent)] data-[variant=removed]:before:shadow-[inset_2px_0_0_var(--destructive)]",
  "after:absolute after:start-1.5 after:top-0 after:text-[color:var(--code-block-muted,var(--muted-foreground))] after:select-none",
  "data-[variant=added]:after:content-['+'] data-[variant=removed]:after:text-destructive data-[variant=removed]:after:content-['−']",
  "in-data-wrap:*:data-[slot=code-block-line-content]:min-w-0",
)
const cls = cn(base, look)
</script>

<template>
  <parts.Line :value="props.value" v-bind="forwarded" :class="cn(cls, attrs.class as any)">
    <template #default="{ state }">
      <slot :state="state">
        <span v-if="state.lineNumbers" data-slot="code-block-line-number" aria-hidden="true" class="select-none">{{ state.number }}</span>
        <span data-slot="code-block-line-content"><template v-if="state.tokens.length === 0">{{ "\n" }}</template><span v-for="(token, index) in state.tokens" v-else :key="index" :data-token="token.kind">{{ token.text }}</span></span>
      </slot>
    </template>
  </parts.Line>
</template>
