<script setup lang="ts">
/* The row above a hunk: its fold, its range and the review actions. */
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
const base = cn(cascade)
</script>

<template>
  <parts.HunkHeader :value="props.value" v-bind="forwarded" :class="cn(base, attrs.class as any)">
    <template #default="scope"><slot v-bind="scope ?? {}"></slot></template>
  </parts.HunkHeader>
</template>
