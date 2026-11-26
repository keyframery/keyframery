<script setup lang="ts">
/* Stacks messages. */
import { computed, useAttrs } from "vue"

import { type Speed, useSpeed } from "@/lib/keyframery"
import { cn } from "@/lib/utils"
import { groupLook, MessageGroupRoot } from "./parts"

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{
    speed?: Speed
  }>(), {})
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs
  return rest
})
const speedStyle = useSpeed(() => props.speed)
</script>

<template>
  <MessageGroupRoot v-bind="forwarded" :style="[speedStyle, attrs.style as any]" :class="cn(groupLook, attrs.class as any)">
    <template #default="scope"><slot v-bind="scope" /></template>
  </MessageGroupRoot>
</template>
