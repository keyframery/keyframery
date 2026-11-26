<script setup lang="ts">
/* Accepts its hunk; rises in where the decision was. */
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"

import { arrive, parts, press } from "./parts"

defineOptions({ inheritAttrs: false })
const props = defineProps<{ value: string }>()
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const base = cn(press, arrive)
</script>

<template>
  <parts.Accept :value="props.value" v-bind="forwarded" :class="cn(base, attrs.class as any)">
    <template #default="scope"><slot v-bind="scope ?? {}">Accept</slot></template>
  </parts.Accept>
</template>
