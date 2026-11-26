<script setup lang="ts">
/* One turn of a conversation. `align="end"` mirrors your own messages to the other side. */
import { computed, onMounted, ref, useAttrs } from "vue"

import { type Speed, useSpeed } from "@/lib/keyframery"
import { cn } from "@/lib/utils"
import { messageClass, MessageRoot } from "./parts"

defineOptions({ inheritAttrs: false })
const props = withDefaults(defineProps<{
    /** `"start"` for the other person, `"end"` for your own: the avatar and bubbles move across. */
    align?: "start" | "end"
    speed?: Speed
  }>(), {})
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, style: _style, ...rest } = attrs
  return rest
})
const speedStyle = useSpeed(() => props.speed)
/* The core plays the entrance when the part binds, unless it sits in history (closest("[data-history]") on a
   message scroller's item). Vue binds a part before its ancestors are in the page, so it joins once mounted
   (React's refs attach after the whole tree is in). */
const mounted = ref(false)
onMounted(() => (mounted.value = true))
</script>

<template>
  <MessageRoot v-if="mounted" v-bind="forwarded" :align="align" :style="[speedStyle, attrs.style as any]" :class="cn(messageClass, attrs.class as any)">
    <template #default="scope"><slot v-bind="scope" /></template>
  </MessageRoot>
</template>
