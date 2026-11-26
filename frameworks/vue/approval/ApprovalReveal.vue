<script setup lang="ts">
/* A panel that opens to its height while `open` (the reason field). Same grid-row recipe as the body. */
import { cn } from "@/lib/utils"

defineOptions({ inheritAttrs: false })
const props = defineProps<{ open: boolean; class?: string }>()
</script>

<template>
  <div
    data-slot="approval-reveal"
    :data-open="props.open ? '' : undefined"
    :inert="!props.open"
    :class="cn('grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity] duration-[calc(320ms*var(--kf-speed,1))] ease-house data-open:grid-rows-[1fr] data-open:opacity-100 motion-reduce:transition-none', props.class)"
    v-bind="$attrs"
  >
    <div class="min-h-0 overflow-hidden"><slot /></div>
  </div>
</template>
