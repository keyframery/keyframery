<script setup lang="ts">
/* The +added and −removed counts. Each digit is a column of 0 to 9; the count rolls up to its value on
   mount and when it changes (× --kf-flourish). Read out as words. */
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"

import { parts } from "./parts"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const base = cn(
  "inline-flex items-center",
  "shrink-0 gap-1.5 font-mono text-[11.5px] leading-none font-medium",
  "*:data-[slot=diff-viewer-additions]:text-[color:color-mix(in_oklab,var(--diff-add)_88%,var(--foreground))]",
  "*:data-[slot=diff-viewer-deletions]:text-[color:color-mix(in_oklab,var(--diff-del)_88%,var(--foreground))]",
)
const column =
  "flex flex-col [translate:0_calc(var(--d)*-1em)] starting:[translate:0_0] transition-[translate] duration-[calc(720ms*var(--kf-speed,1)*var(--kf-flourish,1))] ease-spring delay-[calc((180ms+var(--diff-roll-i,0)*40ms)*var(--kf-speed,1)*var(--kf-flourish,1))] motion-reduce:transition-none"
const digits = (value: number) => String(value).split("")
</script>

<template>
  <parts.Stats v-bind="forwarded" :class="cn(base, attrs.class as any)">
    <template #default="{ state }">
      <slot :state="state">
        <span data-slot="diff-viewer-additions" class="inline-flex items-center">+<span aria-hidden="true" class="inline-flex h-[1em] overflow-hidden leading-none tabular-nums"><span v-for="(c, i) in digits(state.additions)" :key="digits(state.additions).length - i" :style="{ '--d': Number(c) }" :class="column"><span v-for="d in 10" :key="d - 1" class="h-[1em]">{{ d - 1 }}</span></span></span></span>
        <span data-slot="diff-viewer-deletions" class="inline-flex items-center [--diff-roll-i:1]">−<span aria-hidden="true" class="inline-flex h-[1em] overflow-hidden leading-none tabular-nums"><span v-for="(c, i) in digits(state.deletions)" :key="digits(state.deletions).length - i" :style="{ '--d': Number(c) }" :class="column"><span v-for="d in 10" :key="d - 1" class="h-[1em]">{{ d - 1 }}</span></span></span></span>
      </slot>
    </template>
  </parts.Stats>
</template>
