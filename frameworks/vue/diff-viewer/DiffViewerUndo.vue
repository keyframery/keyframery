<script setup lang="ts">
/* Takes the hunk's decision back. */
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
  <parts.Undo :value="props.value" v-bind="forwarded" :class="cn(base, attrs.class as any)">
    <template #default="scope"><slot v-bind="scope ?? {}">Undo</slot></template>
  </parts.Undo>
</template>
