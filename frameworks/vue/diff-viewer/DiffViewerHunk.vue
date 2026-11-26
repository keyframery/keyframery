<script setup lang="ts">
/* One hunk's lines; it rises in with the cascade, and dims when rejected. */
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"

import { parts, cascade } from "./parts"

defineOptions({ inheritAttrs: false })
const props = defineProps<{ value: string }>()
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const base = cn("relative transition-[opacity,filter] duration-[calc(240ms*var(--kf-speed,1))] ease-house motion-reduce:transition-none", cascade)
</script>

<template>
  <parts.Hunk :value="props.value" v-bind="forwarded" :class="cn(base, attrs.class as any)">
    <template #default="scope"><slot v-bind="scope ?? {}"></slot></template>
  </parts.Hunk>
</template>
