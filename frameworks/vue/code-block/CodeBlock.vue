<script setup lang="ts">
/* Animated code block on UI SDK's core (src/components/primitives/code-block.tsx) with the Keyframery look
   (src/components/ui/code-block.tsx): a quiet sheet with a filename row, the code on a slightly sunk ground,
   tokens coloured from the theme's own tokens, and a small key for copying.
   - Cascade: the lines arrive one after another from the left when the block mounts or the code changes.
   - Draw: a highlighted line's band sweeps in from the left.
   - Pop and Draw: on copy, the copy icon blurs away and the tick pops in and draws itself.
   - The cascade, the band's stagger, the tick's draw and the icons' shrink, blur and press scale with --kf-flourish. */
import { computed, useAttrs } from "vue"

import type { CodeBlockLanguage } from "@/components/keyframery/core/code-block-core"
import { Speed, type Speed as SpeedValue } from "@/lib/keyframery"
import { cn } from "@/lib/utils"

import { parts } from "./parts"

defineOptions({ inheritAttrs: false })
const props = withDefaults(
  defineProps<{
    code: string
    language?: CodeBlockLanguage
    lineNumbers?: boolean
    startLine?: number
    highlight?: number[]
    added?: number[]
    removed?: number[]
    wrap?: boolean
    /** `"destructive"` for an error or failed output. */
    variant?: "default" | "destructive"
    /** `"sm"` has tighter padding and 12px code, for tool output. */
    size?: "default" | "sm"
    speed?: SpeedValue
  }>(),
  { lineNumbers: undefined, wrap: undefined, variant: "default", size: "default", speed: undefined },
)
const emit = defineEmits<{ copy: [text: string] }>()
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})

/* Token colours, all from theme tokens. */
const tokens = cn(
  "[&_[data-token=keyword]]:text-ring",
  "[&_[data-token=tag]]:text-ring",
  "[&_[data-token=string]]:text-[color-mix(in_oklab,var(--destructive)_72%,var(--foreground))]",
  "[&_[data-token=number]]:text-[color-mix(in_oklab,var(--destructive)_55%,var(--ring))]",
  "[&_[data-token=comment]]:text-[color:var(--code-block-muted,var(--muted-foreground))] [&_[data-token=comment]]:italic",
  "[&_[data-token=function]]:text-foreground [&_[data-token=function]]:font-medium",
  "[&_[data-token=type]]:text-[color-mix(in_oklab,var(--ring)_55%,var(--foreground))]",
  "[&_[data-token=property]]:text-[color-mix(in_oklab,var(--ring)_40%,var(--foreground))]",
  "[&_[data-token=attribute]]:text-[color-mix(in_oklab,var(--ring)_55%,var(--foreground))]",
  "[&_[data-token=variable]]:text-[color-mix(in_oklab,var(--destructive)_55%,var(--ring))]",
  "[&_[data-token=punctuation]]:text-[color:var(--code-block-muted,var(--muted-foreground))]",
)
const base = cn(
  "group/code-block relative",
  "flex w-full min-w-0 flex-col overflow-hidden rounded-[var(--code-block-radius,14px)] bg-[var(--code-block-face,var(--card))] text-[13px] text-[color:var(--code-block-ink,var(--card-foreground))]",
  "shadow-[0_0_0_1px_rgb(0_0_0/0.07),0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_-12px_rgb(0_0_0/0.12)]",
  "dark:shadow-[0_0_0_1px_rgb(255_255_255/0.08),0_8px_24px_-12px_rgb(0_0_0/0.7)]",
  "has-[>[data-slot=code-block-content]:focus-visible]:ring-2 has-[>[data-slot=code-block-content]:focus-visible]:ring-ring",
  "data-[size=sm]:rounded-[12px] data-[size=sm]:text-[12px]",
  "data-[variant=destructive]:shadow-[0_0_0_1px_color-mix(in_oklab,var(--destructive)_35%,transparent)]",
  tokens,
)
</script>

<template>
  <Speed :speed="props.speed">
    <parts.Root
      :data-variant="props.variant"
      :data-size="props.size"
      :code="props.code"
      :language="props.language"
      :line-numbers="props.lineNumbers"
      :start-line="props.startLine"
      :highlight="props.highlight"
      :added="props.added"
      :removed="props.removed"
      :wrap="props.wrap"
      v-bind="forwarded"
      :class="cn(base, attrs.class as any)"
      @copy="(text: string) => emit('copy', text)"
    >
      <template #default="scope"><slot v-bind="scope ?? {}" /></template>
    </parts.Root>
  </Speed>
</template>

<style>
@keyframes kf-code-line { from { opacity: 0; translate: -10px 0; filter: blur(3px) } }
@keyframes kf-code-tick { from { stroke-dashoffset: 1 } }
</style>
