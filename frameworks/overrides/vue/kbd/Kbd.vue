<script setup lang="ts">
/* One keyboard key. Style `data-pressed` for the pressed look; `pressed` draws it pressed in. */
import { computed, useAttrs } from "vue"

import { type Speed, useSpeed } from "@/lib/keyframery"
import { cn } from "@/lib/utils"
import { KbdRoot, kbdKey, kbdMotion } from "./parts"

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{ pressed?: boolean; speed?: Speed }>(), { pressed: undefined })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs
  return rest
})
const speedStyle = useSpeed(() => props.speed)
</script>

<template>
  <KbdRoot v-bind="forwarded" :pressed="pressed" :style="[speedStyle, attrs.style as any]" :class="cn(kbdMotion, kbdKey, attrs.class as any)">
    <template #default="scope"><slot v-bind="scope" /></template>
  </KbdRoot>
</template>
