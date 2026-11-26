<script setup lang="ts">
/* Copies one value: `value`, or the value it sits beside. With no content it shows a copy icon that turns into a
   drawn check once copied, for two seconds × speed; a quiet square key that turns the success green while it says so.
   `@copy` runs after the text was copied. */
import { computed, onMounted, ref, useAttrs } from "vue"

import { cn } from "@/lib/utils"

import { copyParts } from "./parts"

defineOptions({ inheritAttrs: false })
const props = defineProps<{ value?: string; label?: string }>()
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const base = cn(
  "relative transition-[scale] duration-[calc(260ms*var(--kf-speed,1))] ease-pop active:scale-[calc(1-0.1*var(--kf-flourish,1))] active:duration-[calc(90ms*var(--kf-speed,1))] motion-reduce:transition-none!",
  "grid size-7 shrink-0 cursor-pointer place-items-center rounded-[7px] text-muted-foreground outline-none",
  "hover:bg-[color-mix(in_oklab,var(--foreground)_6%,transparent)] hover:text-foreground",
  "focus-visible:ring-2 focus-visible:ring-ring",
  "data-copied:text-[oklch(0.62_0.16_150)] data-copied:hover:text-[oklch(0.62_0.16_150)]",
)
/* The core reads the label and value beside the button when it binds, with closest(): Vue binds a part before its
   ancestors are in the page, so the button joins the page once the list around it is mounted (React's refs attach
   after the whole tree is in). */
const ready = ref(false)
onMounted(() => (ready.value = true))
const swapIn = "transition-[opacity,scale,filter] duration-[calc(420ms*var(--kf-speed,1))] ease-pop motion-reduce:transition-none!"
const swapOut = "transition-[opacity,scale,filter] duration-[calc(160ms*var(--kf-speed,1))] ease-house motion-reduce:transition-none!"
</script>

<template>
  <copyParts.Root v-if="ready" :value="props.value" :label="props.label" v-bind="forwarded" :class="cn(base, attrs.class as any)">
    <template #default="{ state }">
      <slot :state="state">
        <span class="grid place-items-center *:[grid-area:1/1]">
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
            :class="cn('size-3.5', state.copied ? cn(swapOut, 'scale-[calc(1-0.5*var(--kf-flourish,1))] opacity-0 blur-[calc(3px*var(--kf-flourish,1))]') : swapIn)"
          >
            <rect x="5.25" y="5.25" width="8" height="8" rx="2" />
            <path d="M10.75 5.25V4.5a1.75 1.75 0 0 0-1.75-1.75H4.5A1.75 1.75 0 0 0 2.75 4.5V9c0 .97.78 1.75 1.75 1.75h.75" />
          </svg>
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            stroke-width="1.75"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
            :class="cn('size-3.5', state.copied ? swapIn : cn(swapOut, 'scale-[calc(1-0.4*var(--kf-flourish,1))] opacity-0'))"
          >
            <path
              v-if="state.copied"
              d="M3.5 8.5 6.5 11.5 12.5 4.75"
              pathLength="1"
              class="[stroke-dasharray:1] animate-[kf-dl-tick_calc(300ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-house)_calc(80ms*var(--kf-speed,1)*var(--kf-flourish,1))_backwards] motion-reduce:animate-none"
            />
          </svg>
        </span>
      </slot>
    </template>
  </copyParts.Root>
</template>
