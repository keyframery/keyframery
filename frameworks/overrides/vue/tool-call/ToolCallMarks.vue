<script setup lang="ts">
/* The mark for each status, when the icon is given no content. All six are there; the card's
   `data-status` shows one. A mark that starts showing replays its animation. Internal to ToolCallIcon. */
import { cn } from "@/lib/utils"
import { markPop } from "./parts"
</script>

<template>
  <svg data-mark="pending" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="2 2.2" class="hidden group-data-[status=pending]/tool-call:block">
    <circle cx="8" cy="8" r="5.25" />
  </svg>
  <svg data-mark="running" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" :class="cn('hidden group-data-[status=running]/tool-call:block', 'animate-spin [animation-duration:calc(800ms*var(--kf-speed,1))] motion-reduce:[animation-duration:calc(2400ms*var(--kf-speed,1))]')">
    <circle cx="8" cy="8" r="5.75" opacity="0.22" />
    <path d="M8 2.25A5.75 5.75 0 0 1 13.75 8" />
  </svg>
  <svg data-mark="approval" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" :class="cn('hidden group-data-[status=approval]/tool-call:block', markPop)">
    <circle cx="8" cy="8" r="5.75" />
    <path d="M6.5 6v4M9.5 6v4" />
  </svg>
  <svg data-mark="error" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" :class="cn('hidden group-data-[status=error]/tool-call:block', markPop)">
    <circle cx="8" cy="8" r="5.75" />
    <path d="M8 5v3.25M8 10.75v.01" />
  </svg>
  <svg data-mark="denied" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" :class="cn('hidden group-data-[status=denied]/tool-call:block', markPop)">
    <circle cx="8" cy="8" r="5.75" />
    <path d="m4 4 8 8" />
  </svg>
  <svg data-mark="done" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" :class="cn('hidden group-data-[status=done]/tool-call:block', markPop)">
    <circle cx="8" cy="8" r="5.75" />
    <path
      d="M5.5 8.25 7.25 10l3.25-3.75"
      path-length="1"
      class="[stroke-dasharray:1] animate-[kf-tool-call-tick_calc(320ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-house)_calc(120ms*var(--kf-speed,1)*var(--kf-flourish,1))_backwards] motion-reduce:animate-none"
    />
  </svg>
</template>
