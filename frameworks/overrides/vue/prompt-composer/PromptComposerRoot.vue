<script setup lang="ts">
/* The primitive root (React: primitives/prompt-composer `PromptComposer`). Everything that follows
   the status is styled from it (`group/prompt-composer`). */
import { computed, useAttrs, useSlots } from "vue"

import { cn } from "@/lib/utils"
import { PromptComposerRootPart, rootMotion } from "./parts"

defineOptions({ inheritAttrs: false })
const attrs = useAttrs()
const forwarded = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
const slots = useSlots()
const slotNames = computed(() => Object.keys(slots))
</script>

<template>
  <PromptComposerRootPart v-bind="forwarded" :class="cn(rootMotion, attrs.class as any)">
    <template v-for="name in slotNames" :key="name" #[name]="s">
      <slot :name="name" v-bind="s ?? {}" />
    </template>
  </PromptComposerRootPart>
</template>
