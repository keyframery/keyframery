<script setup lang="ts">
/* "· just now", "· 2s ago", "· 3m ago". A clock, not an animation. */
import { computed, onBeforeUnmount, ref } from "vue"

const props = defineProps<{ at: number }>()
const now = ref(Date.now())
const timer = setInterval(() => (now.value = Date.now()), 1000)
onBeforeUnmount(() => clearInterval(timer))
const text = computed(() => {
  const seconds = Math.max(0, Math.round((now.value - props.at) / 1000))
  return seconds < 1 ? "just now" : seconds < 60 ? `${seconds}s ago` : seconds < 3600 ? `${Math.floor(seconds / 60)}m ago` : `${Math.floor(seconds / 3600)}h ago`
})
</script>

<template>
  <span data-slot="approval-ago" class="tabular-nums"><span aria-hidden="true"> · </span>{{ text }}</span>
</template>
