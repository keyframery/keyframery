<script setup lang="ts">
/* Closes to nothing once the card is answered: a grid row from 1fr to 0fr, so it needs no measuring.
   Put the details and the actions inside. */
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"

import { parts } from "./primitive"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const base = cn(
  "grid grid-rows-[1fr] transition-[grid-template-rows,opacity] duration-[calc(380ms*var(--kf-speed,1))] ease-house",
  "data-resolved:grid-rows-[0fr] data-resolved:opacity-0 data-resolved:duration-[calc(320ms*var(--kf-speed,1))]",
  "motion-reduce:transition-none",
)
</script>

<template>
  <parts.Body v-bind="forwarded" :class="cn(base, attrs.class as any)">
    <template #default="scope">
      <div class="min-h-0 overflow-hidden"><slot v-bind="scope ?? {}" /></div>
    </template>
  </parts.Body>
</template>
