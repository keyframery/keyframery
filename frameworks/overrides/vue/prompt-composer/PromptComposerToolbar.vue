<script setup lang="ts">
/* The row of actions along the foot. */
import { computed, useAttrs, useSlots } from "vue"

import { cn } from "@/lib/utils"
import { PromptComposerToolbarPart } from "./parts"

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
  <PromptComposerToolbarPart v-bind="forwarded" :class="cn('', attrs.class as any)">
    <template v-for="name in slotNames" :key="name" #[name]="s">
      <slot :name="name" v-bind="s ?? {}" />
    </template>
  </PromptComposerToolbarPart>
</template>
