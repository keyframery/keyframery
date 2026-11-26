<script setup lang="ts">
/* One half of the view switch: Unified or Split. */
import { computed, useAttrs } from "vue"

import type { DiffView } from "@/components/keyframery/core/diff-viewer-core"
import { cn } from "@/lib/utils"

import { parts } from "./parts"

defineOptions({ inheritAttrs: false })
const props = defineProps<{ value: DiffView }>()
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const base = "transition-[color,scale] duration-[calc(200ms*var(--kf-speed,1))] ease-pop active:scale-[calc(1-0.05*var(--kf-flourish,1))] motion-reduce:transition-none"
</script>

<template>
  <parts.ViewOption :value="props.value" v-bind="forwarded" :class="cn(base, attrs.class as any)">
    <template #default="scope"><slot v-bind="scope ?? {}">{{ props.value === "split" ? "Split" : "Unified" }}</slot></template>
  </parts.ViewOption>
</template>
