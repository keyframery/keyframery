<script setup lang="ts">
/* "Thinking…" with a light passing through it while it streams, "Thought for 12s" after. */
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"
import { labelClass, parts } from "./parts"

defineOptions({ inheritAttrs: false })
withDefaults(
  defineProps<{
    thinkingLabel?: string
    doneLabel?: (seconds: number | undefined) => string
  }>(),
  {
    thinkingLabel: "Thinking…",
    doneLabel: (seconds: number | undefined) => (seconds === undefined ? "Thought for a few seconds" : `Thought for ${seconds}s`),
  },
)
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
</script>

<template>
  <parts.Label v-bind="forwarded" :class="cn(labelClass, attrs.class as any)">
    <template #default="{ state }">
      <slot :state="state">{{ state.streaming ? thinkingLabel : doneLabel(state.seconds) }}</slot>
    </template>
  </parts.Label>
</template>
