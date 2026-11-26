<script setup lang="ts">
/* The chevron. It turns on a spring as the branch opens, and gives way to a spinner while children load. */
import { computed, useAttrs, useSlots } from "vue"
import { TreeItemIndicator as Part } from "@ui-sdk/vue/tree"
import { cn } from "@/lib/utils"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const slots = useSlots()
const rest = computed(() => {
  const { class: _class, ...r } = attrs
  return r
})
const names = computed(() => Object.keys(slots).filter((n) => n !== "default"))
const base = "[transition:rotate_calc(520ms*var(--kf-speed,1))_var(--ease-pop),color_calc(150ms*var(--kf-speed,1))_var(--ease-house),background-color_calc(150ms*var(--kf-speed,1))_var(--ease-house)] data-expanded:rotate-90 motion-reduce:[transition:none]! group/indicator -m-0.5 grid size-5 shrink-0 place-items-center rounded-[6px] text-[color:var(--tree-ink,var(--muted-foreground))] hover:bg-foreground/[0.08] hover:text-[color:var(--tree-ink,var(--foreground))] data-failed:text-destructive"
</script>

<template>
  <Part v-bind="rest" :class="cn(base, attrs.class as any)">
    <template #default="s">
      <slot v-bind="s ?? {}">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="group-data-loading/indicator:hidden">
          <path d="M6 3.75 10.25 8 6 12.25" />
        </svg>
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
          class="hidden animate-spin [animation-duration:calc(700ms*var(--kf-speed,1))] group-data-loading/indicator:block motion-reduce:[animation-duration:calc(1600ms*var(--kf-speed,1))]">
          <circle cx="8" cy="8" r="5.75" opacity="0.28" />
          <path d="M8 2.25A5.75 5.75 0 0 1 13.75 8" />
        </svg>
      </slot>
    </template>
    <template v-for="n in names" :key="n" #[n]="s">
      <slot :name="n" v-bind="s ?? {}" />
    </template>
  </Part>
</template>
