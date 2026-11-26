<script setup lang="ts">
/* The real scroller, a `log`, so screen readers hear new messages as they arrive. Name it with `aria-label`. */
import { ScrollAreaViewport } from "@/components/keyframery/scroll-area"

withDefaults(defineProps<{ role?: string }>(), { role: "log" })
</script>

<template>
  <ScrollAreaViewport :role="role"><slot /></ScrollAreaViewport>
</template>
