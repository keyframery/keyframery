<script setup lang="ts">
/* The answer's mark: a tick or a cross that pops in and draws itself (flourish). */
defineProps<{ status: string }>()
const draw =
  "[stroke-dasharray:1] animate-[kf-approval-draw_calc(320ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-house)_calc(100ms*var(--kf-speed,1)*var(--kf-flourish,1))_backwards] motion-reduce:animate-none"
</script>

<template>
  <svg
    data-slot="approval-mark"
    aria-hidden="true"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="animate-[kf-approval-pop_calc(380ms*var(--kf-speed,1)*var(--kf-flourish,1))_var(--ease-pop)_backwards] motion-reduce:animate-none"
  >
    <path v-if="status === 'approved'" d="M3.5 8.5 6.5 11.5 12.5 5" pathLength="1" :class="draw" />
    <path v-else d="M4.5 4.5l7 7M11.5 4.5l-7 7" pathLength="1" :class="draw" />
  </svg>
</template>
