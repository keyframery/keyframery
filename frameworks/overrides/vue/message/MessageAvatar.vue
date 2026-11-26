<script setup lang="ts">
/* A round picture at the foot of the turn; it pops in as the first line lands. */
import { computed, useAttrs } from "vue"

import { cn } from "@/lib/utils"
import { avatarClass, MessageAvatarPart } from "./parts"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
</script>

<template>
  <MessageAvatarPart v-bind="forwarded" :class="cn(avatarClass, attrs.class as any)">
    <template #default="scope"><slot v-bind="scope" /></template>
  </MessageAvatarPart>
</template>
