<script setup lang="ts">
/* Shown over the box while files are dragged over it. Fades in; its content rises a little. */
import { computed, useAttrs, useSlots } from "vue"

import { cn } from "@/lib/utils"
import { PromptComposerDropPart, dropMotion } from "./parts"

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
  <PromptComposerDropPart v-bind="forwarded" :class="cn(dropMotion, attrs.class as any)">
    <template v-for="name in slotNames" :key="name" #[name]="s">
      <slot :name="name" v-bind="s ?? {}" />
    </template>
  </PromptComposerDropPart>
</template>
